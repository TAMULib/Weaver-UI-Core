core.controller('RegistrationController', function ($controller, $location, $scope, $timeout, AlertService) {

    angular.extend(this, $controller('AuthenticationController', {
        $scope: $scope
    }));

    const reportSuccess = function (data) {
        if (data?.meta?.status === 'SUCCESS') {
            $timeout(function () {
                AlertService.add(data.meta, 'auth/register');
            });
        }
    };

    $scope.reset = function () {
        $scope.user.clearValidationResults();
        for (var key in $scope.forms) {
            if (!$scope.forms[key].$pristine) {
                $scope.forms[key].$setPristine();
            }
        }
        $scope.registration = {
            email: '',
            token: ''
        };
        $scope.closeModal();
    };

    $scope.reset();

    $scope.verifyEmail = function (email) {
        $scope.user.verifyEmail(email).then(function (data) {
            $scope.reset();

            reportSuccess(data);
        });
    };

    if (typeof $location.search().token != 'undefined') {
        $scope.registration.token = $location.search().token;
    }

    $scope.register = function () {
        $scope.user.register($scope.registration).then(function (data) {
            $scope.reset();

            $location.path("/");

            reportSuccess(data);
        });
    };

});
