/**
 * @ngdoc service
 * @name  core.service:WsService
 * @requires ng.$interval
 * @requires ng.$q
 * @requires core.service:AlertService
 *
 * @description
 *  An angular service wrapper for stop communication over websockets.
 *
 */
core.service("WsService", function ($interval, $q, AlertService) {

    var WsService = this;

    /**
     * @ngdoc property
     * @name  core.service:WsService#WsService.requestCount
     * @propertyOf core.service:WsService
     *
     * @description
     *  A count of all requests.
     *
     */
    WsService.requestCount = 0;

    /**
     * @ngdoc property
     * @name  core.service:WsService#WsService.pendingReq
     * @propertyOf core.service:WsService
     *
     * @description
     *  An object store for pending requests.
     *
     */
    WsService.pendingReq = {};

    /**
     * @ngdoc property
     * @name  core.service:WsService#WsService.delinquentReq
     * @propertyOf core.service:WsService
     *
     * @description
     *  An object store for delinquent requests.
     *
     */
    WsService.delinquentReq = {};

    /**
     * @ngdoc property
     * @name  core.service:WsService#WsService.subscriptions
     * @propertyOf core.service:WsService
     *
     * @description
     *  An object store for subscriptions.
     *
     */
    WsService.subscriptions = {};

    var pendingRequestBank = {};

    var craftRequest = function (request, headers, payload, queued) {
        return {
            defer: $q.defer(),
            timestamp: new Date().getTime(),
            request: request,
            queued: queued,
            resend: function () {
                headers.jwt = sessionStorage.token;
                window.stompClient.send(request, headers, payload);
            }
        };
    }

    /**
     * @ngdoc method
     * @name  core.service:WsService#WsService.subscribe
     * @methodOf core.service:WsService
     * @param {string} channel
     *  The channel which will be subscribed to.
     * @param {boolean=} persist
     *  Indicates that the subscribe channel should not be removed on view change.
     *
     * @description
     *  Registers a subscription to a stomp channel.
     *
     */
    WsService.subscribe = function (channel, persist) {
        var id = "sub-" + window.stompClient.counter;
        var defer;

        if (!persist) persist = false;

        var subObj;

        if ((subObj = WsService.subExist(channel))) {
            defer = subObj.defer;
        } else {

            defer = $q.defer();
            subObj = {
                channel: channel,
                defer: defer
            };

            window.stompClient.subscribe(channel, function (data) {

                var meta = JSON.parse(data.body).meta

                var requestId = meta.id ? meta.id : null;
                var response = meta.type;

                if (WsService.pendingReq[requestId]) {

                    //logger.info("");
                    //logger.debug(channel);
                    //logger.info("Resolving Request " + requestId + ": " + WsService.pendingReq[requestId].request);
                    //logger.log(JSON.parse(data.body));

                    if (response == "REFRESH") {
                        WsService.pendingReq[requestId].defer.notify(data);
                    } else {
                        // We should always resolve to handle alternative notifications.
                        WsService.pendingReq[requestId].defer.resolve(data);
                        AlertService.add(meta, channel);
                        delete WsService.pendingReq[requestId];
                        if (WsService.delinquentReq[requestId]) delete WsService.delinquentReq[requestId];
                    }

                }

                defer.notify(data);

            });

            WsService.subscriptions[id] = subObj;
        }

        return defer.promise;
    };


    /**
     * @ngdoc method
     * @name  core.service:WsService#WsService.send
     * @methodOf core.service:WsService
     * @param {string} request
     *  The destination of this request.
     * @param {object} headers
     *  An object containing desired stomp headers
     * @param {object} payload
     *  An objecct containing any data that should be communicated
     *  with the request
     * @param {string} channel
     *  The chennel which the reseponse will be communicated over.
     *
     * @description
     *  Sends a websocket message.
     *
     */
    WsService.send = function (request, headers, payload, channel) {

        if (!WsService.subExist(channel)) {
            var endpoint = channel;
            var controller = channel.substr(0, channel.lastIndexOf("/"));
            AlertService.create(endpoint);
            AlertService.create(controller);
            WsService.subscribe(channel);
        }

        headers.id = WsService.requestCount++;

        if (Object.keys(payload).length > 0) {
            window.stompClient.send(request, headers, payload);
            WsService.pendingReq[headers.id] = craftRequest(request, headers, payload, false);
        } else {

            if (pendingRequestBank[request]) {

                WsService.pendingReq[headers.id] = craftRequest(request, headers, payload, true);

                pendingRequestBank[request].queue.push(WsService.pendingReq[headers.id]);
            } else {

                pendingRequestBank[request] = {
                    id: headers.id,
                    queue: []
                }

                window.stompClient.send(request, headers, payload);

                WsService.pendingReq[headers.id] = craftRequest(request, headers, payload, false);

                WsService.pendingReq[headers.id].defer.promise.then(function (response) {
                    for (var i in pendingRequestBank[request].queue) {
                        var req = pendingRequestBank[request].queue[i];
                        req.defer.resolve(response);
                    }
                    delete pendingRequestBank[request];
                });

            }
        }

        return WsService.pendingReq[headers.id].defer.promise;

    };

    /**
     * @ngdoc method
     * @name  core.service:WsService#WsService.subExist
     * @methodOf core.service:WsService
     * @param {string} channel
     *  The channel which is being confirmed.
     * @returns {boolean|object}
     *  Returns either false, or the subscription object
     *  associated with the indicated channel.
     * @description
     *  Both requests and confirms the existense of a specific
     *  subscription.
     *
     */
    WsService.subExist = function (channel) {
        for (var key in WsService.subscriptions) {
            var subObj = WsService.subscriptions[key];
            if (subObj.channel == channel) return subObj;
        }
        return false;
    };

    /**
     * @ngdoc method
     * @name  core.service:WsService#WsService.unsubscribe
     * @methodOf core.service:WsService
     * @param {object} sub
     *  The subscription which will be unsubscribed to.
     * @returns {void} returns void
     *
     *  @description
     *   Unsubscribes from the indicated subscription.
     *
     */
    WsService.unsubscribe = function (sub) {
        console.info("Unsubscribing: ", WsService.subscriptions[sub].channel);
        window.stompClient.unsubscribe(sub);
        delete WsService.subscriptions[sub];
    };

    /**
     * @ngdoc method
     * @name  core.service:WsService#WsService.unsubscribeAll
     * @methodOf core.service:WsService
     * @returns {void} returns void
     *
     *  @description
     *   Unsubscribes from all subscriptions.
     *
     */
    WsService.unsubscribeAll = function () {
        for (var key in WsService.subscriptions) {
            var sub = WsService.subscriptions[key];
            if (!sub.persist) {
                WsService.unsubscribe(key);
            }
        }
    };

    $interval(function () {

        var now = new Date().getTime();

        if (WsService.pendingReq.length > 0) {
            console.warn(WsService.pendingReq);
        }

        if (pendingRequestBank.length > 0) {
            console.warn(pendingRequestBank);
        }

        for (var req in WsService.pendingReq) {
            if (now - WsService.pendingReq[req].timestamp > 120000) {
                if (WsService.delinquentReq[req] === undefined) {
                    WsService.delinquentReq[req] = WsService.pendingReq[req];
                    AlertService.add({
                        type: "WARNING",
                        message: "Web service is taking too long to respond. Please refresh. If this continues to appear you can email helpdesk@library.tamu.edu."
                    }, "/app/warnings");
                }
            }
        }

    }, 10000);

});
