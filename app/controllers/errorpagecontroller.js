core.controller("ErrorPageController", function($scope, AccessControllService) {

	$scope.lastRoute = AccessControllService.getLastRoutePath();

});