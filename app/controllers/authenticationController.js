core.controller('AuthenticationController', function ($controller, $scope, $location, $window, AuthServiceApi, StorageService, User, WsApi) {

    angular.extend(this, $controller('AbstractController', {$scope: $scope}));

    $scope.login = function() {
    	
    	delete sessionStorage.token;
        delete sessionStorage.role;

    	User.login();

        User.get();

    	if(appConfig.mockRole) {
			$window.open(appConfig.authService + "/token?referer="+location.origin + appConfig.base + "&mock=" + appConfig.mockRole, "_self");
		}
		else {
			$window.open(appConfig.authService + "/token?referer="+location.origin + appConfig.base + "editPage", "_self");
		}

    };

    $scope.logout = function() {

        delete sessionStorage.token;
        sessionStorage.role = "ROLE_ANONYMOUS";

        $(".dropdown").dropdown("toggle");

        $location.path('/');

    };

});
