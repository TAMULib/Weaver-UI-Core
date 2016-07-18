core.controller('LoginController', function ($controller, $location, $scope) {
	
    angular.extend(this, $controller('AbstractController', {$scope: $scope}));

    angular.extend(this, $controller('AuthenticationController', {$scope: $scope}));
    
	$scope.login = function() {
		$scope.user.authenticate($scope.account).then(function(data) {
			$scope.reset();
		});
	};

});