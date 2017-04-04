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
 * The following must be added to a model for it to extending this AbstractModel
 * <pre>
 *  angular.extend(self, AbstractModel);
 * </pre>
 *
 * @description
 *	This abstract model should be inherited by all models using
 * 	the TAMU-UI-Core. It exposes unwrapping capabilites. All abstracted methods can go here: (e.g. AbstractModel.myMethod = funciton() {} )
 *	A model can then extend this my including "self = this;" and "angular.extend(self, AbstractModel);"
 * 	in its contructor.
 *
 */
core.service("AssumedControl", function ($q, AuthServiceApi, StorageService, UserService, ModelCache, SubscriptionService) {

    var AssumedControl = function () {
        return this;
    }

    var initiliazed = false;
    var set = false;
    var locked = false;

    AssumedControl.data = null;

    AssumedControl.promise = null;

    AssumedControl.set = function (data) {
        angular.extend(AssumedControl.data, data);
        AssumedControl.promise.resolve();
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
        return $q(function (resolve) {

            if (!locked) {

                locked = true;

                logger.log("Assuming user");

                StorageService.set('assumedUser', JSON.stringify(user));

                StorageService.set('assuming', 'true');

                StorageService.set('adminToken', StorageService.get("token"));

                AuthServiceApi.getAssumedUser(user).then(function (response) {

                    if (response.data.assumed) {

                        ModelCache.clear();
                        SubscriptionService.clear();

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

                logger.log("Unassuming user");

                StorageService.delete('assumedUser');
                StorageService.set('assuming', 'false');
                StorageService.set('token', StorageService.get("adminToken"));

                AssumedControl.set({
                    'netid': '',
                    'button': 'Assume User',
                    'status': ''
                });

                ModelCache.clear();
                SubscriptionService.clear();

                UserService.fetchUser();

                StorageService.set('assumed', 'false');

                StorageService.set("role", role);

                locked = false;

                resolve();
            }

        });
    };

    return AssumedControl;

});
