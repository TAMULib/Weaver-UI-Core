/**
 *
 * @ngdoc service
 * @name  core.service:User
 * @requires core.service:AbstractModel
 * @requires core.service:WsApi
 * @constructor
 * @param {object} futureData The models data, from the webservice, to be extended onto the model itself.
 * @returns {service} User returns the User service
 * 
 * @example
 * <pre>
 *		myApp.controller('MyController', function (User) { 
 *			$scope.user = User.get();
 *		}
 * </pre>
 * 	
 * @description
 *	This User service must be injected into a controller class that require dependency on User model. This model provides
 *  the user credentials to a controller. A model can then extend this by including "self = this;" and "angular.extend(self, AbstractModel);"
 * 	in its contructor.
 * 
 */
core.service("User", function($q, $timeout, AbstractModel, StorageService, UserSettings, RestApi, WsApi) {

	var self;

	/**
	 * @ngdoc method
	 * @name  core.service:User#User
	 * @methodOf core.service:User
 	 * @param {object} futureData 
 	 *  The models data, from the webservice, to be extended onto the model itself.
 	 * 
 	 * @description
	 * 	The constructor for the User Service.
	 */
	var User = function(futureData) {
		self = this;
		angular.extend(self, AbstractModel);		
		self.unwrap(self, futureData);		
	};

	var anonymousUser = new User({
		affiliation: null,
		email: null,
		exp: null,
		firstName: null,
		lastName: null,
		netid: null,
		role: "ROLE_ANONYMOUS",
		uin: null
	});

	/**
	 * @ngdoc property
	 * @name core.service:User#User.anonymous
	 * @propertyOf core.service:User
	 *
	 * @description
	 * 	A property of User object to store the 'ROLE_ANONYMOUS' value or the 'sessionStorage.role' value.
	 **/
	User.anonymous = (sessionStorage.role == 'ROLE_ANONYMOUS');
	
	User.data = null;

	User.promise = null;
	
	/**
	 * @ngdoc method
	 * @name core.service:User#User.set
	 * @methodOf core.service:User
	 * @param {object=} data User credentials.
	 * @returns {void} returns void
	 * 
	 * @description
	 * 	A method to set the data  as 'Credentials' on User object. 
	 */
	User.set = function(data) {
		self.unwrap(self, data);
	};

	/**
	 * @ngdoc method
	 * @name core.service:User#User.get
	 * @methodOf core.service:User
	 * @param {object=} data User credentials.
	 * @returns {void} returns void
	 * 
	 * @description
	 * 	This method will check for the User 'role' and return user credentials else it would return 'ANONYMOUS' 
	 */
	User.get = function() {
		if(User.promise) return User.data;
		if(User.anonymous) {
			var deferred = $q.defer();
			User.promise = deferred.promise;
			$timeout(function() {
				deferred.resolve(anonymousUser);
			});
		}
		else {
			User.promise = WsApi.fetch({
				endpoint: '/private/queue', 
				controller: 'user', 
				method: 'credentials'
			});
		}		

		if(User.data) {
			User.promise.then(function(data) {
				User.set(JSON.parse(data.body).payload.Credentials);
			});
		}
		else {
			User.data = new User(User.promise);	
		}

		return User.data;
	};

	/**
	 * @ngdoc method
	 * @name core.service:User#User.getAffiliation
	 * @methodOf core.service:User
	 * @returns {string} returns User.affiliation
	 * 
	 * @description
	 * 	This method will return the User 'affiliation' property. 
	 */
	User.getAffiliation = function() {
		return User.affiliation;
	};

	/**
	 * @ngdoc method
	 * @name core.service:User#User.ready
	 * @methodOf core.service:User
	 * @returns {Promise} returns Promise
	 * 
	 * @description
	 * 	This method will return the User 'Promise' object once the document load event is completed. 
	 */
	User.ready = function() {
		return User.promise;
	};

	/**
	 * @ngdoc method
	 * @name core.service:User#User.refresh
	 * @methodOf core.service:User
	 * @returns {User} returns User
	 * 
	 * @description
	 * 	This method will return the User credentials upon refresh. 
	 */
	User.refresh = function() {
       User.promise = null;
       return User.get();
   	};

	/**
	 * @ngdoc method
	 * @name core.service:User#User.login
	 * @methodOf core.service:User
	 * @returns {User} returns User
	 * 
	 * @description
	 * 	This method will set the User.anonymous value to false and will return the User Credentials from User.refresh
	 */
	User.login = function() {		
		User.anonymous = false;
		return User.refresh();
	};

	User.verifyEmail = function(email) {
		var deferred = $q.defer();

		RestApi.anonymousGet({
			controller: 'auth',
			method: 'register?email=' + email
		}).then(function(data) {

			deferred.resolve(data);

		});

		return deferred.promise;
	};

	User.register = function(registration) {
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

	User.authenticate = function(account) {		
		var deferred = $q.defer();

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

				var user = User.login();

				User.ready().then(function() {
					StorageService.set("role", user.role);
					deferred.resolve(data);
					UserSettings.refresh();
				});
			}

		});

		return deferred.promise;
	};

	return User;
	
});
