core.service("WsApi", function($q, $http, wsservice, AuthServiceApi) {

	var WsApi = this;

	WsApi.listen = function(apiReq) {
		var request = '/ws/' + apiReq.controller + '/' + apiReq.method;
		var channel = apiReq.endpoint + "/" + apiReq.controller;
		
		if(apiReq.method) {
			channel +=  "/" + apiReq.method;
		}
		return wsservice.subscribe(channel);
	};

	WsApi.fetch = function(apiReq) {

		var request = '/ws/' + apiReq.controller + '/' + apiReq.method;	  
		var channel = apiReq.endpoint + "/" + apiReq.controller + "/" + apiReq.method;

		var headers = {
			'jwt': sessionStorage.token, 
			'data': (typeof apiReq.data != 'undefined') ? JSON.stringify(apiReq.data) : '{}'
		};

		var fetchPromise = wsservice.send(request, headers, {}, channel);

		fetchPromise.then(null, null, function(data) {
 
			var meta = JSON.parse(data.body).meta;

			if(meta.type == "REFRESH") {
				if(sessionStorage.assumedUser) {					
					AuthServiceApi.getAssumedUser(JSON.parse(sessionStorage.assumedUser)).then(function() {
						wsservice.pendingReq[meta.id].resend();
					});
				} else {
					AuthServiceApi.getRefreshToken().then(function() {
						wsservice.pendingReq[meta.id].resend();
					});
				}
			}
		});

		return fetchPromise;
	};
	
});
