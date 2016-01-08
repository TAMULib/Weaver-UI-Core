core.controller('UserController', function ($controller, $scope, StorageService, User) {

	angular.extend(this, $controller('AbstractController', {$scope: $scope}));

	$scope.user = User.get();

	$scope.ready = User.ready();

	if(!$scope.isAnonymous() && User.ready() != null) {
		User.ready().then(function() {
			StorageService.set('role', $scope.user.role);
		});
	}

});

