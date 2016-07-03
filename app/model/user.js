vireo.model("User", function ($q, RestApi, StorageService) {

	return function User() {

		var user = this;
		
		// additional model methods and variables

		this.anonymous = (sessionStorage.role == 'NONE');

		this.authDefer = $q.defer();

		this.login = function() {		
			user.anonymous = false;
			return user.refresh();
		};

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

				deferred.resolve(data);

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
				
				deferred.resolve(data);
							
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

				if(typeof data.payload.JWT == 'undefined') {
					console.log("User does not exist!");
				}
				else {
					StorageService.set("token", data.payload.JWT.tokenAsString);

					delete sessionStorage.role;

					var user = user.login();

					user.ready().then(function() {
						StorageService.set("role", user.role);
						deferred.resolve(data);
					});
				}

			});

			return deferred.promise;
		};

		return this;
	}

});