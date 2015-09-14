core.service("AuthServiceApi",function($http, $timeout) {

	var AuthServiceApi = this;

	AuthServiceApi.pendingRefresh = null;
	AuthServiceApi.pendingAssumptions = {};

	AuthServiceApi.getAssumedUser = function(assume, cb) {
		if (!AuthServiceApi.pendingAssumptions[assume.netid]) {
			AuthServiceApi.pendingAssumptions[assume.netid] = $http.get(appConfig.authService+"/admin?netid="+assume.netid,{withCredentials: true}).
				then(function(response) { 
					if(response.data.assumed) {
						StorageService.set('token', response.data.assumed.tokenAsString);
					}

					// This timeout ensures that pending request is not nulled to early
					$timeout(function() {
						AuthServiceApi.pendingAssumptions[assume.netid] = null;
					});
					if(cb) cb();
					return response;   
			});
		}
		return AuthServiceApi.pendingAssumptions[assume.netid];
	};

	AuthServiceApi.getRefreshToken = function(cb) {
		if (!AuthServiceApi.pendingRefresh) {
			AuthServiceApi.pendingRefresh = $http.get(appConfig.authService+"/refresh", {withCredentials: true}).
				then(function(response) {
					
						StorageService.set('token', response.data.tokenAsString);			
						
						// This timeout ensures that pending request is not nulled to early
						$timeout(function() {
							AuthServiceApi.pendingRefresh = null;
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
