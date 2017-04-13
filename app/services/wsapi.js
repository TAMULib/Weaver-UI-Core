/**
 * @ngdoc service
 * @name  core.service:WsApi
 * @requires ng.$q
 * @requires ng.$http
 * @requires core.service:WsService
 * @requires core.service:AuthServiceApi
 *
 * @description
 *  A service wrapper for the webservices api.
 *
 */
core.service("WsApi", function ($q, $http, WsService, AuthServiceApi) {

    var WsApi = this;

    /**
     * @ngdoc method
     * @name  core.service:WsApi#WsApi.listen
     * @methodOf core.service:WsApi
     * @param {object} apiReq
     *  An apireq which containes the channel, controller and method
     *  which should be listened to.
     * @returns {Promsie} A promise from a websocket subscription subscription
     *
     * @description
     *  This method gives a promise which is notified upon
     *  websocket communication on the desired channel
     *
     */
    WsApi.listen = function (apiReq) {
        var request = '/ws/' + apiReq.controller + '/' + apiReq.method;
        var channel = apiReq.endpoint + "/" + apiReq.controller;

        if (apiReq.method) {
            channel += "/" + apiReq.method;
        }

        var subscriptionPromise;

        var subscription = WsService.getSubscription(channel);

        if (subscription) {
            subscriptionPromise = subscription.defer.promise;
        } else {
            console.info('Subscribing:', [apiReq.endpoint, '/', apiReq.controller, apiReq.method ? '/' + apiReq.method : ''].join(''));
            subscriptionPromise = WsService.subscribe(channel);
        }

        return subscriptionPromise;
    };

    WsApi.clearSubscriptions = function () {
        WsService.unsubscribeAll();
    };

    /**
     * @ngdoc method
     * @name  core.service:WsApi#WsApi.fetch
     * @methodOf core.service:WsApi
     * @param {object} apiReq
     *  An apireq which containes the channel, controller and method
     *  which should be listened to.
     * @returns {Promsie} A promise from the WsService send method
     *
     * @description
     *  This method gives a promise which is resolved by id upon
     *  websocket communication on the desired channel
     *
     */
    WsApi.fetch = function (initialReq, manifest) {

        var apiReq = angular.copy(initialReq);

        if (manifest && manifest.pathValues) {
            for (var key in manifest.pathValues) {
                var value = manifest.pathValues[key];
                apiReq.method = apiReq.method.replace(new RegExp(':' + key, 'g'), value);
            }
        }

        if (manifest && manifest.data) {
            apiReq.data = manifest.data;
        }

        var request = '/ws/' + apiReq.controller + '/' + apiReq.method;
        var channel = apiReq.endpoint + "/" + apiReq.controller + "/" + apiReq.method;

        var headers = {
            'jwt': sessionStorage.token,
            'data': (typeof apiReq.data != 'undefined') ?
                JSON.stringify(apiReq.data) : '{}'
        };

        var fetchPromise = WsService.send(request, headers, {}, channel);

        fetchPromise.then(null, null, function (response) {

            var meta = JSON.parse(response.body).meta;

            if (meta.type == "REFRESH") {
                if (sessionStorage.assumedUser) {
                    AuthServiceApi.getAssumedUser(JSON.parse(sessionStorage.assumedUser)).then(function () {
                        WsService.getPendingRequest(meta.id).resend();
                    });
                } else {
                    AuthServiceApi.getRefreshToken().then(function () {
                        WsService.getPendingRequest(meta.id).resend();
                    });
                }
            }
        });

        return fetchPromise;
    };

    return WsApi;

});
