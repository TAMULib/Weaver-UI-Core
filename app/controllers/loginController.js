core.controller('LoginController', function ($controller, $location, $scope, $timeout, AlertService, RestApi, StorageService, User) {
	
    angular.extend(this, $controller('AbstractController', {$scope: $scope}));
    
    $scope.account = {
    	email: '',
    	password: ''
    };

    AlertService.create('auth/login');
    AlertService.create('auth');

	$scope.login = function() {
		RestApi.anonymousGet({
			controller: 'auth',
			method: 'login',
			data: $scope.account
		}).then(function(data) {

			if(data.meta.type == 'ERROR') {
			 	$timeout(function() {
					AlertService.add(data.meta, 'auth/login');
				});
			}
			else {

				$scope.account = {
			    	email: '',
			    	password: ''
			    };
    
				StorageService.set("token", data.payload.JWT.tokenAsString);

				delete sessionStorage.role;

				var user = User.login();

				User.ready().then(function() {
					StorageService.set("role", user.role);
				});

				angular.element('#loginModal').modal('hide');

				AlertService.removeAll('auth/login');
				
			}
		});
	};

});