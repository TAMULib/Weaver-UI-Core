/**
 * @ngdoc service
 * @name  core.service:WsApi
 * @requires ng.$q
 * @requires core.service:RestApi
 * @requires core.service:WsService
 *
 * @description
 *  A service wrapper for the webservices api.
 *
 */
core.service("WsApi", function ($q, $location, $rootScope, RestApi, RequestUtil, WsService) {

    var WsApi = this;

    var listenCount = 0;

    var subscriptions = {};

    var routeBasedChannels = {};

    $rootScope.$on("$routeChangeStart", function (evt, next, current) {
        WsService.unsubscribeAll();
    });

    $rootScope.$on("$routeChangeSuccess", function (evt, next, current) {
        var path = $location.path();
        var channels = routeBasedChannels[path];
        if (channels) {
            for (var i in channels) {
                WsApi.listen(channels[i]);
            }
        }
    });

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
        var channel;
        if (typeof apiReq === 'string') {
            channel = apiReq;
        } else {
            channel = apiReq.endpoint + "/" + apiReq.controller;
            if (apiReq.method) {
                channel += "/" + apiReq.method;
            }
        }
        if (subscriptions[channel] === undefined) {
            console.log('subscribed', channel);
            subscriptions[channel] = WsService.subscribe(channel, listenCount++, true, function () {
                console.log('unsubscribed', channel);
                delete subscriptions[channel];
                listenCount--;
            }).defer.promise;

            var path = $location.path();
            var channels = routeBasedChannels[path];
            if (channels === undefined) {
                routeBasedChannels[path] = channels = [];
            }
            channels.push(channel);
        }
        return subscriptions[channel]
    };

    WsApi.clearSubscriptions = function () {
        WsService.unsubscribeAll();
        listenCount = 0;
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

        var apiReq = RequestUtil.prepareRequest(initialReq, manifest);

        if (apiReq.useWebSockets) {
            var request = '/ws/' + apiReq.controller + '/' + apiReq.method;
            var channel = apiReq.endpoint + "/" + apiReq.controller + "/" + apiReq.method;

            var headers = {
                'jwt': sessionStorage.token
            };

            var payload = apiReq.data !== undefined && apiReq.data !== null ? JSON.stringify(apiReq.data) : JSON.stringify({});

            return WsService.send(request, headers, payload, channel);
        }


        var restSend = RestApi.get;

        if(apiReq.method) {
          restSend = RestApi[apiReq.method];
        } else {
          restSend = (apiReq.data !== undefined && apiReq.data !== null) ? RestApi.post : restSend;
        }

        return $q(function (resolve, reject) {
            restSend(apiReq).then(function (res) {
                resolve({
                    body: angular.toJson(res)
                });
            });
        });
    };

    return WsApi;

});
