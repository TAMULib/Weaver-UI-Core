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

    var requestCount = 0;

    var pendingRequests = {};

    var delinquentRequests = {};

    var subscriptions = {};

    var pendingRequestBank = {};

    var sendRequest = function (request, headers, payload, queued) {
        if (!queued) {
            window.stompClient.send(request, headers, payload);
        }
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
    };

    var completeRequest = function (channel, meta, requestId) {
        AlertService.add(meta, channel);
        delete pendingRequests[requestId];
        delete delinquentRequests[requestId];
    };

    var processResponse = function (channel, response) {
        var responseBody = JSON.parse(response.body)
        var meta = responseBody.meta

        var requestId = meta.id ? meta.id : null;
        var status = meta.type;

        if (pendingRequests[requestId]) {
            if (status === "REFRESH") {
                pendingRequests[requestId].defer.notify(response);
            } else if (status === "ERROR") {
                // lets reject the errors as the response body with channel added
                responseBody.channel = channel;
                pendingRequests[requestId].defer.reject(responseBody);
                completeRequest(channel, meta, requestId);
            } else {
                // if not refresh or error resolve to handle alternative notifications
                pendingRequests[requestId].defer.resolve(response);
                completeRequest(channel, meta, requestId);
            }
        }
    };

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
        var subscription = {
            channel: channel,
            defer: $q.defer(),
            persist: persist
        };
        console.info('Subscribing:', channel);
        window.stompClient.subscribe(channel, function (response) {
            subscription.defer.notify(response);
            processResponse(channel, response);
        });

        subscriptions["sub-" + window.stompClient.counter] = subscription;

        return subscription.defer.promise;
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

        if (WsService.getSubscription(channel) === undefined) {
            var controller = channel.substr(0, channel.lastIndexOf("/"));
            AlertService.create(channel);
            AlertService.create(controller);
            WsService.subscribe(channel);
        }

        headers.id = requestCount++;

        if (Object.keys(payload).length > 0) {
            pendingRequests[headers.id] = sendRequest(request, headers, payload, false);
        } else {

            if (pendingRequestBank[request]) {

                pendingRequests[headers.id] = sendRequest(request, headers, payload, true);

                pendingRequestBank[request].queue.push({
                    id: headers.id,
                    promise: pendingRequests[headers.id]
                });
            } else {

                pendingRequests[headers.id] = sendRequest(request, headers, payload, false);

                pendingRequestBank[request] = {
                    id: headers.id,
                    queue: []
                };

                pendingRequests[headers.id].defer.promise.then(function (response) {
                    for (var i in pendingRequestBank[request].queue) {
                        var pendReq = pendingRequestBank[request].queue[i];
                        pendReq.promise.defer.resolve(response);
                        delete pendingRequests[pendReq.id];
                    }
                    delete pendingRequestBank[request];
                });

            }
        }

        return pendingRequests[headers.id].defer.promise;
    };

    /**
     * @ngdoc method
     * @name  core.service:WsService#WsService.getSubscription
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
    WsService.getSubscription = function (channel) {
        var subscription;
        for (var key in subscriptions) {
            if (subscriptions[key].channel === channel) {
                subscription = subscriptions[key];
                break;
            }
        }
        return subscription;
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
        console.info("Unsubscribing: ", subscriptions[sub].channel);
        window.stompClient.unsubscribe(sub);
        delete subscriptions[sub];
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
        for (var key in subscriptions) {
            var subscription = subscriptions[key];
            if (!subscription.persist) {
                WsService.unsubscribe(key);
            }
        }
    };

    WsService.getPendingRequest = function (id) {
        return pendingRequests[id];
    };

    $interval(function () {

        var now = new Date().getTime();

        if (Object.keys(pendingRequests).length > 0) {
            console.warn(pendingRequests);
        }

        if (Object.keys(pendingRequestBank).length > 0) {
            console.warn(pendingRequestBank);
        }

        for (var req in pendingRequests) {
            if (now - pendingRequests[req].timestamp > 120000) {
                if (delinquentRequests[req] === undefined) {
                    delinquentRequests[req] = pendingRequests[req];
                    AlertService.add({
                        type: "WARNING",
                        message: "Web service is taking too long to respond. Please refresh. If this continues to appear you can email helpdesk@library.tamu.edu."
                    }, "/app/warnings");
                }
            }
        }

    }, 10000);

    return WsService;

});
