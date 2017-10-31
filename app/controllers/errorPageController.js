core.controller("ErrorPageController", function ($scope, AccessControlService) {

    $scope.lastRoute = AccessControlService.getLastRoutePath();

});
