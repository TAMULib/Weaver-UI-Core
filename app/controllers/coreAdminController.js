core.controller('CoreAdminController', function ($controller, $injector, $route, $scope, AssumedControl, AuthServiceApi, StorageService, UserService, WsApi) {

    angular.extend(this, $controller('AbstractController', {
        $scope: $scope
    }));

    $scope.assumedControl = AssumedControl.get();

    AssumedControl.set({
        'netid': '',
        'button': $scope.isAssuming() == 'true' ? 'Unassume User' : 'Assume User',
        'status': $scope.isAssuming() == 'true' ? 'assumed' : '',
    });

    $scope.user = UserService.getCurrentUser();

    $scope.$watch('user.role', function () {
        if ($scope.user.role) {
            StorageService.set('role', $scope.user.role);
            if ($scope.user.role == 'ROLE_ADMIN') {
                $scope.admin = true;
            } else {
                $scope.admin = false;
            }
        }
    });

    $scope.assumeUser = function (user) {

        if ($scope.isAssuming() == 'false') {

            if ((typeof user !== 'undefined') && user.netid) {

                AssumedControl.assume(user).then(function (assumed) {
                    if (assumed) {
                        $scope.closeModal();
                        $route.reload();
                    }
                });

            } else {
                logger.log("User to assume undefined!");
            }

        } else {

            AssumedControl.unassume(user, $scope.user.role).then(function (unassumed) {
                $route.reload();
            });

        }

    };

    $scope.cancelAssumeUser = function () {
        $scope.closeModal();
        AssumedControl.cancel();
    }

    $scope.isMocking = function () {
        if (appConfig.mockRole) {
            return true;
        } else {
            return false;
        }
    };

    $scope.logout = function (url) {
        StorageService.delete('token');
        StorageService.delete('role');
        window.open(url, "_self");
    };

});
