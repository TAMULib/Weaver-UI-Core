core.controller('RegistrationController', function ($controller, $location, $scope, $timeout, AlertService, User) {
	
    angular.extend(this, $controller('AbstractController', {$scope: $scope}));
    
    var user = new User();
    
    var reset = function() {
    	$scope.registration = {
	    	email: '',
	    	token: ''
	    };
    };
    
    reset();
	
	$scope.verifyEmail = function(email) {
		user.verifyEmail(email).then(function(data) {
			reset();
			$timeout(function() {
				AlertService.add(data.meta, 'auth/register');
			});
		});		
	};

	if(typeof $location.search().token != 'undefined') {
		$scope.registration.token = $location.search().token;
	}

	$scope.register = function() {
		user.register($scope.registration).then(function(data) {
			reset();

		    $location.path("/");

		    $timeout(function() {
				AlertService.add(data.meta, 'auth/register');
			});
		});
	};

});