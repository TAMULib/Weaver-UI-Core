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
core.service("User", function(AbstractModel, WsApi) {

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
       User.get();
   	};

	/**
	 * @ngdoc method
	 * @name core.service:User#User.login
	 * @methodOf core.service:User
	 * @returns {User} returns User
	 * 
	 * @description
	 * 	This method will set the User.promise property to null, User.anonymous value to false and will return the User Credentials 
	 */
	User.login = function() {
		User.promise = null;
		User.anonymous = false;
		return User.get();
	};

	return User;
	
});