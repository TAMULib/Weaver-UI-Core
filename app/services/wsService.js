/**
 * @ngdoc service
 * @name  core.service:WsService
 * @requires ng.$interval
 * @requires ng.$q
 * @requires core.service:AlertService
 * @requires core.service:AuthService
 *
 * @description
 *  An angular service wrapper for stop communication over websockets.
 *
 */
core.service("WsService", function ($interval, $q, AlertService, AuthService) {

    var WsService = this;

    var requestCount = 0;

    var pendingRequests = {};

    var delinquentRequests = {};

    var subscriptions = {};

    var pendingRequestBank = {};

    var refreshingToken = false;

    var waitingRequests = [];

    var craftPendingRequest = function (subscription, request, headers, payload, queued) {
        return {
            request: request,
            subscription: subscription,
            timestamp: new Date().getTime(),
            queued: queued,
            resend: function () {
                headers.jwt = sessionStorage.token;
                window.stompClient.send(request, headers, payload);
            }
        };
    };

    var completeRequest = function (meta, requestId) {
        AlertService.add(meta, pendingRequests[requestId].subscription.channel);
        WsService.unsubscribe(pendingRequests[requestId].subscription);
        delete pendingRequests[requestId];
        delete delinquentRequests[requestId];
    };

    var refreshToken = function (requestId) {
        refreshingToken = true;
        if (sessionStorage.assumedUser) {
            AuthService.getAssumedUser(JSON.parse(sessionStorage.assumedUser)).then(function () {
                pendingRequests[requestId].resend();
                sendWaitingRequests();
            });
        } else {
            AuthService.getRefreshToken().then(function () {
                pendingRequests[requestId].resend();
                sendWaitingRequests();
            });
        }
    };

    var sendWaitingRequests = function () {
        refreshingToken = false;
        for (var i in waitingRequests) {
            pendingRequests[waitingRequests[i]].resend();
        }
        waitingRequests.length = 0;
    };

    var processResponse = function (message) {
        var messageContent = JSON.parse(message.body);
        var meta = messageContent.meta;

        var requestId = meta.id ? meta.id : null;
        var status = meta.status;

        if (pendingRequests[requestId]) {
            message.ack({
                channel: pendingRequests[requestId].subscription.channel,
                id: requestId
            });
            if (status === "REFRESH") {
                refreshToken(requestId);
            } else if (status === "ERROR") {
                // lets reject the errors as the response body with channel added
                messageContent.channel = pendingRequests[requestId].subscription.channel;
                pendingRequests[requestId].subscription.defer.reject(messageContent);
                completeRequest(meta, requestId);
            } else {
                // if not refresh or error resolve to handle alternative notifications
                pendingRequests[requestId].subscription.defer.resolve(message);
                completeRequest(meta, requestId);
            }
        }
        // messages on the same channel will be processed even after the pendingRequest has been processed
    };

    var hasPayload = function (obj) {
        var count = 0;
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ++count;
            }
        }
        return count > 0;
    };

    var send = function (request, headers, payload) {
        if (refreshingToken) {
            waitingRequests.push(headers.id);
        } else {
            window.stompClient.send(request, headers, payload);
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
    WsService.subscribe = function (channel, requestId, listen, unsubscribeCb) {

        var id = "sub-" + window.stompClient.counter + "-" + requestId;

        var subscription = subscriptions[id];

        if (subscription === undefined) {

            subscription = {
                id: id,
                channel: channel,
                defer: $q.defer(),
                listen: listen
            };

            if (listen) {
                subscription.unsubscribeCb = unsubscribeCb;
            }

            var subscriptionCallback;

            var subscriptionHeaders;

            if (subscription.listen) {
                subscriptionCallback = function (message) {
                    subscription.defer.notify(message);
                };
                subscriptionHeaders = {};
            } else {
                var controller = channel.substr(0, channel.lastIndexOf("/"));
                AlertService.create(channel);
                AlertService.create(controller);
                subscriptionCallback = function (message) {
                    processResponse(message);
                };
                subscriptionHeaders = {
                    ack: "client"
                };
            }

            window.stompClient.subscribe(channel, subscriptionCallback, subscriptionHeaders);

            subscriptions[id] = subscription;
        }

        return subscription;
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
        headers.id = requestCount++;

        var subscription = WsService.subscribe(channel, headers.id, false);

        if (hasPayload(payload) || headers.data !== undefined) {
            send(request, headers, payload);
            pendingRequests[headers.id] = craftPendingRequest(subscription, request, headers, payload, false);

        } else {
            if (pendingRequestBank[request]) {
                pendingRequests[headers.id] = craftPendingRequest(subscription, request, headers, payload, true);
                pendingRequestBank[request].queue.push({
                    id: headers.id,
                    subscription: pendingRequests[headers.id].subscription
                });
            } else {
                send(request, headers, payload);
                pendingRequests[headers.id] = craftPendingRequest(subscription, request, headers, payload, false);
                pendingRequestBank[request] = {
                    id: headers.id,
                    queue: []
                };
                pendingRequests[headers.id].subscription.defer.promise.then(function (response) {
                    for (var i in pendingRequestBank[request].queue) {
                        var pendingRequest = pendingRequestBank[request].queue[i];
                        pendingRequest.subscription.defer.resolve(response);
                        delete pendingRequests[pendingRequest.id];
                    }
                    delete pendingRequestBank[request];
                });

            }
        }

        return pendingRequests[headers.id].subscription.defer.promise;
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
    WsService.unsubscribe = function (subscription) {
        window.stompClient.unsubscribe(subscription.channel);
        if (subscriptions[subscription.id].listen) {
            subscriptions[subscription.id].unsubscribeCb();
        }
        delete subscriptions[subscription.id];
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
        for (var id in subscriptions) {
            WsService.unsubscribe(subscriptions[id]);
        }
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
            if (now - pendingRequests[req].timestamp > 240000) {
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