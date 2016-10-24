core.service("FileApi",function($http, $q, $window, AuthServiceApi, Upload) {

	var webservice = appConfig.webService;

	var authservice = appConfig.authService;

	this.anonymousDownload = function(req) {

		var url = appConfig.webService + "/" + req.controller + "/" + req.method;

		var data = (typeof req.data != 'undefined') ? JSON.stringify(req.data) : '{}';

		return $http({
				method: 'GET',
    			url: url,
    			headers: {
   					'data': data
   				},
   				responseType: 'arraybuffer'
   			}).then(
			//success callback	
			function(response) {
				return response.data;
			},
			//error callback
			function(response) {
				return response.data;
			});
	};

	this.anonymousUpload = function(req) {
		var url = appConfig.webService + "/" + req.controller + "/" + req.method;
		return attemptAnonymousUpload({
            url: url,
            data: {
            	file: req.file
            }
        }, $q.defer());
	};
	
	var attemptAnonymousUpload = function(uploadObj, defer) {
		Upload.upload(uploadObj).then(function (response) {
			defer.resolve(response);
        }, function (response) {
        	defer.resolve(response); 
        }, function (event) {
            defer.notify(parseInt(100.0 * event.loaded / event.total));
        });
		return defer.promise;
	}

	this.download = function(req, isUrl) {

		var url = isUrl ? req : appConfig.webService + "/" + req.controller + "/" + req.method;

		var data = (typeof req.data != 'undefined') ? JSON.stringify(req.data) : '{}';

		var restObj = {
			method: 'GET',
			url: url,
			headers: {
				'jwt': sessionStorage.token,
				'data': data,
				'X-Requested-With': undefined
			},
			responseType: 'arraybuffer'
		};

		return $http(restObj).then(
			//success callback	
			function(response) {
				return response.data;
			},
			//error callback
			function(response) {
				if(response.data.code == "EXPIRED_JWT") {
					
					if(sessionStorage.assumedUser) {
					
						return AuthServiceApi.getAssumedUser(JSON.parse(sessionStorage.assumedUser)).then(function() {
							restObj.headers.jwt = sessionStorage.token;
							return $http(restObj).then(function(response) {
								return response.data;	
							});
						});
						
					} else {
						
						return AuthServiceApi.getRefreshToken().then(function() {
							restObj.headers.jwt = sessionStorage.token;
							return $http(restObj).then(function(response) {
								return response.data;	
							});
						});
						
					}

				} else {
					$window.location.replace(authservice + "/token?referer=" + window.location);
				}
			});
	};

	this.upload = function(req) {

		var url = appConfig.webService + "/" + req.controller + "/" + req.method;
		
		return attemptUpload({
            url: url,
            data: {
            	file: req.file
            },
            headers: {
    			'jwt': sessionStorage.token,
    			'X-Requested-With': undefined
    		}
        }, $q.defer());
	};
	
	var attemptUpload = function(uploadObj, defer) {

		Upload.upload(uploadObj).then(function (response) {
			defer.resolve(response);
        }, function (response) {
            if(response.data.code == "EXPIRED_JWT") {
				
				if(sessionStorage.assumedUser) {
				
					return AuthServiceApi.getAssumedUser(JSON.parse(sessionStorage.assumedUser)).then(function() {
						uploadObj.headers.jwt = sessionStorage.token;
						attemptUpload(uploadObj, defer);
					});
					
				} else {
					
					return AuthServiceApi.getRefreshToken().then(function() {
						uploadObj.headers.jwt = sessionStorage.token;
						attemptUpload(uploadObj, defer);
					});
					
				}

			} else {
				$window.location.replace(authservice + "/token?referer=" + window.location);
			}
            
        }, function (event) {
            defer.notify(parseInt(100.0 * event.loaded / event.total));
        });

		return defer.promise;
	}

});