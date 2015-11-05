core.controller('AuthenticationController', function ($controller, $location, $scope, $window, User) {

    angular.extend(this, $controller('AbstractController', {$scope: $scope}));

    $scope.login = function(page) {
        
        delete sessionStorage.token;
        delete sessionStorage.role;

        User.login();

        User.get();

        var path = '';

        if(typeof page != 'undefined') {
            path = "/" + location.pathname.split("/")[1] + "/" + page;
        }
        else {
            path = location.pathname;
        }

        if(appConfig.mockRole) {
            $window.open(appConfig.authService + "/token?referer="+ location.origin + path + "&mock=" + appConfig.mockRole, "_self");
        }
        else {
            $window.open(appConfig.authService + "/token?referer="+ location.origin + path, "_self");
        }

    };

    $scope.logout = function() {

        delete sessionStorage.token;
        sessionStorage.role = "ROLE_ANONYMOUS";

        angular.element(".dropdown").dropdown("toggle");

        $location.path('/');

    };

});
