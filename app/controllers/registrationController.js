core.controller('RegistrationController', function ($controller, $location, $scope, $timeout, AlertService, RestApi) {
	
    angular.extend(this, $controller('AbstractController', {$scope: $scope}));
    
    $scope.registration = {
    	email: '',
    	token: ''
    };
	
	$scope.verifyEmail = function(email) {
		RestApi.anonymousGet({
			controller: 'auth',
			method: 'register?email=' + email
		}).then(function(data) {
			$scope.registration.email = '';
			$timeout(function() {
				AlertService.add(data.meta, 'auth/register');
			});
		});
	};

	if(typeof $location.search().token != 'undefined') {
		$scope.registration.token = $location.search().token;
	}

	$scope.register = function() {
		
		RestApi.anonymousGet({
			'controller': 'auth',
			'method': 'register',
			'data': $scope.registration
		}).then(function(data) {

			$scope.registration = {
		    	email: '',
		    	token: ''
		    };

		    $location.path("/");

		    $timeout(function() {
				AlertService.add(data.meta, 'auth/register');
			});
						
		});
	};

});