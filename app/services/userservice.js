core.service("UserService",function(StorageService, User, WsApi) {

    var UserService = this;

    UserService.currentUser = new User();

    UserService.fetchUser = function() {
    	WsApi.fetch(UserService.currentUser.getMapping().instantiate).then(function(res) {
    		delete sessionStorage.role;
    		var credentials = angular.fromJson(res.body).payload.Credentials;
    		UserService.currentUser.anonymous = credentials.role == 'NONE' ? true : false;
			angular.extend(UserService.currentUser, credentials);
			StorageService.set("role", UserService.currentUser.role);
		});
    };

    UserService.setCurrentUser = function(user) {
        angular.extend(UserService.currentUser, user);
    };

    UserService.getCurrentUser = function() {
        return UserService.currentUser;
    };

});
