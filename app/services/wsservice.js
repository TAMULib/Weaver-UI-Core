/**
 * @ngdoc service
 * @name  core.service:wsservice
 * @requires ng.$interval
 * @requires ng.$q
 * @requires core.service:AlertService
 *
 * @description 
 *  An angular service wrapper for stop communication over websockets.
 * 
 */
core.service("wsservice", function($interval, $q, AlertService) { 
	
	var wsservice = this;
	
	/**
	 * @ngdoc property
	 * @name  core.service:wsservice#wsservice.pendingReqCounter
	 * @propertyOf core.service:wsservice
	 *
	 * @description 
	 *  A count of all unresolved requests.
	 * 
	 */
	wsservice.pendingReqCounter = 0;
	
	/**
	 * @ngdoc property
	 * @name  core.service:wsservice#wsservice.pendingReq
	 * @propertyOf core.service:wsservice
	 *
	 * @description 
	 *  An object store for pending requests.
	 * 
	 */
	wsservice.pendingReq = {};
	
	/**
	 * @ngdoc property
	 * @name  core.service:wsservice#wsservice.subscriptions
	 * @propertyOf core.service:wsservice
	 *
	 * @description 
	 *  An object store for subscriptions.
	 * 
	 */
	wsservice.subscriptions = {};

	/**
	 * @ngdoc method
	 * @name  core.service:wsservice#wsservice.subscribe
	 * @methodOf core.service:wsservice
	 * @param {string} channel 
	 *  The channel which will be subscribed to.
	 * @param {boolean=} persist 
	 *  Indicates that the subscribe channel should not be removed on view change.
	 *
	 * @description 
	 *  Registers a subscription to a stomp channel.
	 * 
	 */
	wsservice.subscribe = function(channel, persist) {		
		var id = "sub-" + window.stompClient.counter;		
		var defer;
		
		if(!persist) persist = false;
		
		var subObj;

		if((subObj = wsservice.subExist(channel))) {
			defer = subObj.defer;
		} else {
			
			defer = $q.defer();
			subObj = {
				channel: channel,
				defer: defer
			};

			window.stompClient.subscribe(channel, function(data) {
				
				var meta = JSON.parse(data.body).meta

				var requestId = meta.id ? meta.id : null;				
				var response = meta.type;

				if(wsservice.pendingReq[requestId]) {

					//logger.info("");
					//logger.debug(channel);
					//logger.info("Resolving Request " + requestId + ": " + wsservice.pendingReq[requestId].request);
					//logger.log(JSON.parse(data.body));
					
					if(response == "REFRESH") {
						wsservice.pendingReq[requestId].defer.notify(data);
					} else {
						// We should always resolve to handle alternative notifications.
						wsservice.pendingReq[requestId].defer.resolve(data);
						AlertService.add(meta, channel);
						delete wsservice.pendingReq[requestId];	
					}
					
				}
				
				defer.notify(data);

			});

			wsservice.subscriptions[id] = subObj;
		}

		return defer.promise;
	};

	/**
	 * @ngdoc method
	 * @name  core.service:wsservice#wsservice.send
	 * @methodOf core.service:wsservice
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
	wsservice.send = function(request, headers, payload, channel) {

		if(!wsservice.subExist(channel)) {
			var endpoint = channel; 
			var controller = channel.substr(0, channel.lastIndexOf("/"));
			AlertService.create(endpoint);
			AlertService.create(controller);
			wsservice.subscribe(channel);
		}
		
		headers.id = wsservice.pendingReqCounter++;

		window.stompClient.send(request, headers, payload);
		
		wsservice.pendingReq[headers.id] = {
			defer: $q.defer(),
			timestamp: new Date().getTime(),
			resend: function() {
				headers.jwt = sessionStorage.token;
				window.stompClient.send(request, headers, payload);
			}
		};

		return wsservice.pendingReq[headers.id].defer.promise;
		
	};

	/**
	 * @ngdoc method
	 * @name  core.service:wsservice#wsservice.subExist
	 * @methodOf core.service:wsservice
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
	wsservice.subExist = function(channel) {
		for(var key in wsservice.subscriptions) {
			var subObj = wsservice.subscriptions[key];
			if(subObj.channel == channel) return subObj;
		}
		return false;
	};
	
	/**
	 * @ngdoc method
	 * @name  core.service:wsservice#wsservice.unsubscribe
	 * @methodOf core.service:wsservice
	 * @param {object} sub 
	 *  The subscription which will be unsubscribed to.
	 * @returns {void} returns void
	 *
	 *  @description 
	 *   Unsubscribes from the indicated subscription.
	 * 
	 */
	wsservice.unsubscribe = function(sub) {
		window.stompClient.unsubscribe(sub);
		delete wsservice.subscriptions[sub];
	};

	/**
	 * @ngdoc method
	 * @name  core.service:wsservice#wsservice.unsubscribeAll
	 * @methodOf core.service:wsservice
	 * @returns {void} returns void
	 *
	 *  @description 
	 *   Unsubscribes from all subscriptions.
	 * 
	 */
	wsservice.unsubscribeAll = function() {
		for(var key in wsservice.subscriptions){
			var sub = wsservice.subscriptions[key];
			if(!sub.persist) wsservice.unsubscribe(key);
		}
	};

	$interval(function() {

		var now = new Date().getTime();

		for(var req in wsservice.pendingReq) {
			if(now - wsservice.pendingReq[req].timestamp > 60000) {
				AlertService.add({type: "WARNING", message: "Web service is taking too long to respond. Please refresh. If this continues to appear you can email helpdesk@library.tamu.edu."}, "/app/warnings");  
			} 
		}

	}, 10000);

});