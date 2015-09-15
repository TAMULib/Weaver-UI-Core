core.service("AuthServiceApi",function($http, $timeout, StorageService) {

	var AuthServiceApi = this;

	AuthServiceApi.getAssumedUser = function(assume, cb) {
		if (!AuthServiceApi.pendingRefresh) {
			AuthServiceApi.pendingRefresh = $http.get(appConfig.authService+"/admin?netid="+assume.netid,{withCredentials: true}).
				then(function(response) {

					if(response.data.assumed) {
						StorageService.set('token', response.data.assumed.tokenAsString);
					}

					// This timeout ensures that pending request is not nulled to early
					$timeout(function() {
						delete AuthServiceApi.pendingRefresh;
					});

					if(cb) cb();
					return response;   
			});
		}
		return AuthServiceApi.pendingRefresh;
	};

	AuthServiceApi.getRefreshToken = function(cb) {
		if (!AuthServiceApi.pendingRefresh) {
			AuthServiceApi.pendingRefresh = $http.get(appConfig.authService+"/refresh", {withCredentials: true}).
				then(function(response) {

						StorageService.set('token', response.data.tokenAsString);
						
						// This timeout ensures that pending request is not nulled to early
						$timeout(function() {
							delete AuthServiceApi.pendingRefresh;
						});
						
						if(cb) cb();
					},
					function(response) {
						
						delete sessionStorage.token;

						if(appConfig.mockRole) {
							window.open(appConfig.authService + "/token?referer="+location.href + "&mock=" + appConfig.mockRole, "_self");
						}
						else {
							window.open(appConfig.authService + "/token?referer="+location.href, "_self");
						}

				});
		}
		return AuthServiceApi.pendingRefresh;
	};	

});
