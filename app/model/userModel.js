/**
 *
 * @ngdoc service
 * @name  core.service:User
 * @requires AbstractModel
 * @requires WsApi
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
 *  the user credentials to a controller.
 *  Extends {@link core.model:AbstractModel 'AbstractModel'}
 * 
 */
core.service("User", function(AbstractModel, WsApi) {

	var self;

	/**
	 * @constructor
 	 * @param {object} futureData The models data, from the webservice, to be extended onto the model itself.
 	 * @returns {service} User returns User object
 	 * 
 	 * @description
	 * 	The constructor for the User Service.
	 */
	var User = function(futureData) {
		self = this;
		angular.extend(self, AbstractModel);		
		self.unwrap(self, futureData, "Credentials");		
	};

	User.anonymous = (sessionStorage.role == 'ROLE_ANONYMOUS');
	
	User.data = null;

	User.promise = null;
	
	User.set = function(data) {
		self.unwrap(self, data, "Credentials");
	};

	User.get = function() {
		if(User.anonymous) return "ANONYMOUS";
		if(User.promise) return User.data;

		User.promise = WsApi.fetch({
				endpoint: '/private/queue', 
				controller: 'user', 
				method: 'credentials',
		});

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

	User.getAffiliation = function() {
		return User.affiliation;
	};

	User.ready = function() {
		return User.promise;
	};

	User.refresh = function() {
       User.promise = null;
       User.get();
   	};

	User.login = function() {
		User.promise = null;
		User.anonymous = false;
		return User.get();
	};

	return User;
	
});
