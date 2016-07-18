core.model("User", function ($q, RestApi, StorageService) {

	return function User() {

		var user = this;
		
		// additional model methods and variables

		this.anonymous = (sessionStorage.role == 'NONE');

		this.authDefer = $q.defer();

		this.logout = function() {
			user.anonymous = true;
			user.authDefer = $q.defer();
		};

		this.verifyEmail = function(email) {
			var deferred = $q.defer();

			RestApi.anonymousGet({
				controller: 'auth',
				method: 'register?email=' + email
			}).then(function(data) {

				if(data.meta.type == 'INVALID') {
					user.setValidationResults(data.payload.ValidationResults);
				}
				else {
					deferred.resolve(data);
				}

			});

			return deferred.promise;
		};

		this.register = function(registration) {
			var deferred = $q.defer();

			RestApi.anonymousGet({
				'controller': 'auth',
				'method': 'register',
				'data': registration
			}).then(function(data) {				
				
				if(data.meta.type == 'INVALID') {
					user.setValidationResults(data.payload.ValidationResults);
				}
				else {
					deferred.resolve(data);
				}
							
			});

			return deferred.promise;
		};

		this.authenticate = function(account) {		
			var deferred = user.authDefer;

			RestApi.anonymousGet({
				controller: 'auth',
				method: 'login',
				data: account
			}).then(function(data) {

				if(typeof data.payload.JWT !== 'undefined') {					
					StorageService.set("token", data.payload.JWT.tokenAsString);					
				}

				if(data.meta.type == 'INVALID') {
					user.setValidationResults(data.payload.ValidationResults);
				}
				else {
					deferred.resolve(data);
				}

			});

			return deferred.promise;
		};

		return this;
	}

});