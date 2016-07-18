core.controller('RegistrationController', function ($controller, $location, $scope, $timeout, AlertService) {
	
    angular.extend(this, $controller('AbstractController', {$scope: $scope}));

    angular.extend(this, $controller('AuthenticationController', {$scope: $scope}));
    
    $scope.reset = function() {
    	$scope.user.clearValidationResults();
    	for(var key in $scope.forms) {
            if(!$scope.forms[key].$pristine) {
                $scope.forms[key].$setPristine();
            }
        }
    	$scope.registration = {
	    	email: '',
	    	token: ''
	    };
	    $scope.closeModal();
    };
    
    $scope.reset();
	
	$scope.verifyEmail = function(email) {
		$scope.user.verifyEmail(email).then(function(data) {
			if(data.meta.type == 'INVALID') {
				$scope.user.setValidationResults(data.payload.ValidationResults);
			}
			else {
				$scope.reset();
				$timeout(function() {
					AlertService.add(data.meta, 'auth/register');
				});
			}			
		});		
	};

	if(typeof $location.search().token != 'undefined') {
		$scope.registration.token = $location.search().token;
	}

	$scope.register = function() {
		$scope.user.register($scope.registration).then(function(data) {
			if(data.meta.type == 'INVALID') {
				$scope.user.setValidationResults(data.payload.ValidationResults);
			}
			else {
				$scope.reset();

			    $location.path("/");

			    $timeout(function() {
					AlertService.add(data.meta, 'auth/register');
				});
			}
		});
	};

});