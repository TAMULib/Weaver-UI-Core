/**
 * @ngdoc controller
 * @name core.controller:AuthenticationController
 * @requires $controller
 * @requires $location
 * @requires $scope
 * @requires $window
 * @requires core.service:User
 *
 * @example
 * The following must be added to authentication controller for it to extend AbstractController
 *  <pre>
 *      angular.extend(this, $controller('AbstractController', {$scope: $scope}));
 *  </pre> 
 *
 * @description
 *  This authentication controller contains login and logout methods. These methods based on user credentials 
 *  will modify the user role and provide the necessary token to navigate to pages which require access based on roles.
 *
**/
core.controller('AuthenticationController', function ($controller, $location, $scope, $window, User) {

    angular.extend(this, $controller('AbstractController', {$scope: $scope}));
    /**
     * @ngdoc method
     * @name core.controller:AuthenticationController#$scope.login
     * @methodOf core.controller:AuthenticationController
     * @returns {void} returns void
     * 
     * @description
     *  The login method deletes the default 'ROLE_ANONYMOUS' and its specific token based on user role found in 
     *  user credentials.
     */
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

    /**
     * @ngdoc method
     * @name core.controller:AuthenticationController#$scope.logout
     * @methodOf core.controller:AuthenticationController
     * @returns {void} returns void
     * 
     * @description
     *  The logout method will delete the session storage token, will set the sessionStorage role to default 'ROLE_ANONYMOUS' and will 
     *  direct to the default home page
     */
    $scope.logout = function() {

        delete sessionStorage.token;
        sessionStorage.role = "ROLE_ANONYMOUS";

        angular.element(".dropdown").dropdown("toggle");

        $location.path('/');

    };

});
