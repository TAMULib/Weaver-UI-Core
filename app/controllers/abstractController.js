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

	$scope.isAnnotator = function() {
		return (sessionStorage.role == "ROLE_ANNOTATOR");
	};

	$scope.isManager = function() {
		return (sessionStorage.role == "ROLE_MANAGER");
	};

	$scope.isAdmin = function() {
		return (sessionStorage.role == "ROLE_ADMIN");
	};

});
