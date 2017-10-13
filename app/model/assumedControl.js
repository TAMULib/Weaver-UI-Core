/**
 *
 * @ngdoc service
 * @name  core.service:AssumedControl
 * @requires $scope
 * @constructor
 * @param {object} data The models data, from the webservice, to be extended onto the model itself.
 * @returns {service} AssumedControl returns AssumedControl
 *
 * @example
 * TODO
 *
 * @description
 *	TODO
 *
 */
core.service("AssumedControl", function ($q, AuthServiceApi, StorageService, UserService, ModelCache, ModelUpdateService, WsApi) {

    var AssumedControl = function () {
        return this;
    }

    var initiliazed = false;
    var set = false;
    var locked = false;

    var callbacks = [];

    AssumedControl.data = null;

    AssumedControl.promise = null;

    AssumedControl.set = function (data) {
        angular.extend(AssumedControl.data, data);
        AssumedControl.promise.resolve();
    };

    AssumedControl.addCallback = function (callback) {
        callbacks.push(callback);
    };

    AssumedControl.get = function () {

        if (!initiliazed) {
            initiliazed = true;
            if (StorageService.get("assumed") != 'true') {
                StorageService.set('assumed', 'false');
            }
            if (StorageService.get("assuming") != 'true') {
                StorageService.set('assuming', 'false');
            }
        }

        var newAssumedControlPromise = $q.defer();

        AssumedControl.promise = newAssumedControlPromise;

        if (AssumedControl.data) {
            AssumedControl.promise.resolve();
        } else {
            AssumedControl.data = new AssumedControl(newAssumedControlPromise);
        }

        return AssumedControl.data;
    };

    AssumedControl.ready = function () {
        return AssumedControl.promise;
    };

    AssumedControl.assume = function (user) {

        AssumedControl.set({
            'status': 'assuming'
        });

        return $q(function (resolve) {

            if (!locked) {

                locked = true;

                StorageService.set('assumedUser', JSON.stringify(user));

                StorageService.set('assuming', 'true');

                StorageService.set('adminToken', StorageService.get("token"));

                AuthServiceApi.getAssumedUser(user).then(function (response) {

                    if (response.data.assumed) {

                        WsApi.clearSubscriptions();

                        for (var i in callbacks) {
                            callbacks[i]();
                        }

                        ModelCache.clear();
                        ModelUpdateService.clear();

                        UserService.fetchUser();

                        StorageService.set('assumed', 'true');

                        AssumedControl.set({
                            'netid': user.netid,
                            'button': 'Unassume User',
                            'status': 'assumed'
                        });

                        resolve(true);

                    } else {

                        StorageService.set('assuming', 'false');

                        AssumedControl.set({
                            'netid': user.netid,
                            'button': 'Assume User',
                            'status': 'invalid netid'
                        });

                        resolve(false);
                    }

                });

                locked = false;
            }

        });
    };

    AssumedControl.unassume = function (user, role) {
        return $q(function (resolve) {

            if (!locked) {

                locked = true;

                StorageService.delete('assumedUser');
                StorageService.set('assuming', 'false');
                StorageService.set('token', StorageService.get("adminToken"));

                AssumedControl.set({
                    'netid': '',
                    'button': 'Assume User',
                    'status': ''
                });

                WsApi.clearSubscriptions();

                ModelCache.clear();
                ModelUpdateService.clear();

                for (var i in callbacks) {
                    callbacks[i]();
                }

                UserService.fetchUser();

                StorageService.set('assumed', 'false');

                StorageService.set("role", role);

                locked = false;

                resolve();
            }

        });
    };

    AssumedControl.cancel = function () {
        AssumedControl.set({
            'netid': '',
            'button': 'Assume User',
            'status': ''
        });
    };

    return AssumedControl;

});
