core.service("RestApi",function($http, $window, AuthServiceApi) {

	var webservice = appConfig.webService;
	var authservice = appConfig.authService;

	this.get = function(req) {

		var url = appConfig.webService + "/" + req.controller + "/" + req.method;

		return $http({
				method: 'GET',
    			url: url,
   				headers: {
   					'jwt': sessionStorage.token, 
   					'data': (typeof req.data != 'undefined') ? JSON.stringify(req.data) : '{}'
   				}
   			}).then(
			//success callback	
			function(response) {
				return response.data;
			},
			//error callback
			function(response) {
				if(response.data.message == "EXPIRED_JWT") {
					
					if(sessionStorage.assumedUser) {
					
						return AuthServiceApi.getAssumedUser(JSON.parse(sessionStorage.assumedUser)).then(function() {
							return $http.get(uri, {headers:{'jwt':sessionStorage.token}}).then(function(response) {
								return response.data;	
							});
						});
						
					} else {
						
						return AuthServiceApi.getRefreshToken().then(function() {
							return $http.get(uri, {headers:{'jwt':sessionStorage.token}}).then(function(response) {
								return response.data;	
							});
						});
						
					}

				} else {
					$window.location.replace(authservice + "/token?referer=" + window.location);
				}
			});
	};


	this.post = function(req) {

		var url = appConfig.webService + "/" + req.controller + "/" + req.method;

		return $http({
				method: 'POST',
    			url: url,
   				data: req.file,
   				headers: {
   					'jwt': sessionStorage.token, 
   					'data': (typeof req.data != 'undefined') ? JSON.stringify(req.data) : '{}'
   				}
   			}).then(

			//success callback	
			function(response) {
				return response.data;
			},

			//error callback
			function(response) {
				console.log(response);
				if(response.data.message == "EXPIRED_JWT") {
					
					if(sessionStorage.assumedUser) {
					
						return AuthServiceApi.getAssumedUser(JSON.parse(sessionStorage.assumedUser)).then(function() {
							return $http({
										method: 'POST',
						    			url: url,
						   				data: req.file,
						   				headers: {
						   					'jwt': sessionStorage.token, 
						   					'data': (typeof req.data != 'undefined') ? JSON.stringify(req.data) : '{}'
						   				}
						   			}).then(function(response) {
								return response.data;	
							});
						});
						
					} else {
						
						return AuthServiceApi.getRefreshToken().then(function() {
							return $http({
										method: 'POST',
						    			url: url,
						   				data: req.file,
						   				headers: {
						   					'jwt': sessionStorage.token, 
						   					'data': (typeof req.data != 'undefined') ? JSON.stringify(req.data) : '{}'
						   				}
						   			}).then(function(response) {
								return response.data;	
							});
						});
						
					}

				} else {
					$window.location.replace(authservice + "/token?referer=" + window.location);
				}
			});
	};

});