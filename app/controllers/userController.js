core.controller('UserController', function ($controller, $scope, User) {

	angular.extend(this, $controller('AbstractController', {$scope: $scope}));

	$scope.user = User.get();
	
});

