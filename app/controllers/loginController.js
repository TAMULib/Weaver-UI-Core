core.controller('LoginController', function ($controller, $location, $scope, $window, StorageService, UserService) {

    angular.extend(this, $controller('AuthenticationController', {
        $scope: $scope
    }));

    $scope.login = function () {
        $scope.user.authenticate($scope.account).then(function (data) {
            $scope.reset();
            UserService.fetchUser().then(function() {
                var authorizeUrl = StorageService.get("post_authorize_url");
                if (authorizeUrl) {
                    StorageService.delete("post_authorize_url");
                    $window.location.assign(authorizeUrl);
                } else {
                    $window.location.reload();
                }
            });
        });
    };

});
