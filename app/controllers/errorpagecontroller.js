core.controller("ErrorPageController", function($scope, AccessControllService) {

	$scope.lastRoute = AccessControllService.getLastRoutePath();

	console.log($scope.lastRoute);

});