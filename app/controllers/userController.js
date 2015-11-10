core.controller('UserController', function ($controller, $scope, StorageService, User) {

	angular.extend(this, $controller('AbstractController', {$scope: $scope}));

	$scope.user = User.get();

	if(!$scope.isAnonymous() && User.ready() != null) {
		User.ready().then(function() {
			StorageService.set('role', $scope.user.role);
		});
	}

});

