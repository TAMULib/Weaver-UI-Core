core.service("wsservice", function($q, AlertService) { 
	
	var wsservice = this;
	
	wsservice.pendingReqCounter = 0;
	
	wsservice.pendingReq = {};
	
	wsservice.subscriptions = {};

	wsservice.client = window.stompClient;
	
	delete window.stompClient;

	wsservice.subscribe = function(channel, persist) {		
		var id = "sub-"+wsservice.client.counter;		
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

			wsservice.client.subscribe(channel, function(data) {
				
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
						delete wsservice.pendingReq[requestId];	
					}
					
				}
				
				AlertService.add(meta, channel);
				
				defer.notify(data);

			});

			wsservice.subscriptions[id] = subObj;
		}

		return defer.promise;
	};

	wsservice.send = function(request, headers, payload, channel) {

		if(!wsservice.subExist(channel)) {
			var endpoint = channel; 
			var controller = channel.substr(0, channel.lastIndexOf("/"));
			AlertService.create(endpoint);
			AlertService.create(controller);
			wsservice.subscribe(channel);
		}
		
		headers.id = wsservice.pendingReqCounter++;

		wsservice.client.send(request, headers, payload);
		
		wsservice.pendingReq[headers.id] = {
			defer: $q.defer(),
			resend: function() {
				headers.jwt = sessionStorage.token;
				wsservice.client.send(request, headers, payload);
			}
		};

		return wsservice.pendingReq[headers.id].defer.promise;
		
	};

	wsservice.subExist = function(channel) {
		for(var key in wsservice.subscriptions) {
			var subObj = wsservice.subscriptions[key];
			if(subObj.channel == channel) return subObj;
		}
		return false;
	};
	
	wsservice.unsubscribe = function(sub) {
		wsservice.client.unsubscribe(sub);
		delete wsservice.subscriptions[sub];
	};

	wsservice.unsubscribeAll = function() {
		for(var key in wsservice.subscriptions){
			var sub = wsservice.subscriptions[key];
			if(!sub.persist) wsservice.unsubscribe(key);
		}
	};

});
