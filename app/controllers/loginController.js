core.controller('LoginController', function ($controller, $location, $scope, $window, StorageService) {

    angular.extend(this, $controller('AuthenticationController', {
        $scope: $scope
    }));

    $scope.login = function () {
        $scope.user.authenticate($scope.account).then(function (data) {
            $scope.reset();
            var authorizeUrl = StorageService.get("post_authorize_url");
            if (authorizeUrl) {
                StorageService.delete("post_authorize_url");
                $location.path(authorizeUrl);
            }
            $window.location.reload();
        });
    };

});
