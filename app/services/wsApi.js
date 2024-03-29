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
core.service("WsApi", function ($q, $location, $rootScope, AlertService, RestApi, WsService) {

    var WsApi = this;

    var listenCount = 0;

    var subscriptions = {};

    var routeBasedChannels = {};

    var persistentRouteBasedChannels = [];

    var toPath = function(next) {
        var paths;
        if(next.$$route !== undefined) {
            paths = next.$$route.originalPath.substring(1).split('/');
            for(var i in paths) {
                if(paths[i][0] === ':') {
                    paths[i] = next.pathParams[paths[i].substring(1)];
                }
            }
        } else {
            paths = [];
        }
        return paths.join('/');
    };

    $rootScope.$on("$routeChangeStart", function (evt, next, current) {
        var path = toPath(next);
        if(persistentRouteBasedChannels.indexOf(path) < 0) {
            WsService.unsubscribeAll();
        }
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

    WsApi.registerPersistentRouteBasedChannel = function(path) {
        if(persistentRouteBasedChannels.indexOf(path) < 0) {
            persistentRouteBasedChannels.push(path);
        }
    };

    /**
     * @ngdoc method
     * @name  core.service:WsApi#WsApi.listen
     * @methodOf core.service:WsApi
     * @param {object} apiReq
     *  An apireq which contains the channel, controller and method
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
        subscriptions[channel].then(null, null, function (message) {
            var messageContent = JSON.parse(message.body);
            if (angular.isDefined(messageContent.meta.action)) {
                AlertService.add(messageContent.meta, channel + ':' + messageContent.meta.action);
            } else {
                AlertService.add(messageContent.meta, channel);
            }
        });
        return subscriptions[channel];
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

        if (manifest && manifest.query) {
            apiReq.query = manifest.query;
        }

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

        if (manifest && manifest.method) {
            restSend = RestApi[manifest.method];
        } else if (apiReq.httpMethod) {
            restSend = RestApi[apiReq.httpMethod];
        } else {
            restSend = (apiReq.data !== undefined && apiReq.data !== null) ? RestApi.post : restSend;
        }

        if (manifest && manifest.headers) {
            apiReq.headers = manifest.headers;
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
