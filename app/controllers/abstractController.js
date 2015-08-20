core.controller('AbstractController', function ($scope, StorageService) {

	$scope.isAssumed = function() {
		return StorageService.get("assumed");
	};

	$scope.isAssuming = function() {
		return StorageService.get("assuming");
	};

	$scope.isAnonymous = function() {
		return (sessionStorage.role == "ROLE_ANONYMOUS");
	};

	$scope.isUser = function() {
		return (sessionStorage.role == "ROLE_USER");
	};

	$scope.isAdmin = function() {
		return (sessionStorage.role == "ROLE_ADMIN");
	};
	
	$scope.isManager = function() {
		return (sessionStorage.role == "ROLE_MANAGER");
	};
			
});
