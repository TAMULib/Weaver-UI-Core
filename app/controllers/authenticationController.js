/**
 * @ngdoc controller
 * @name core.controller:AuthenticationController
 * @requires $controller
 * @requires $location
 * @requires $scope
 * @requires $window
 * @requires core.service:User
 * @example
 *  <pre>
 *      <element ng-controller="AuthenticationController"></element>
 *  </pre>
 *
 * @description
 *  This authentication controller contains login and logout methods. These methods based on user credentials
 *  will modify the user role and provide the necessary token to navigate to pages which require access based on roles.
 *  Extends {@link core.controller:AbstractController 'AbstractController'}
 *
 **/
core.controller('AuthenticationController', function ($controller, $location, $scope, $window, UserService, ValidationStore) {

    angular.extend(this, $controller('AbstractController', {
        $scope: $scope
    }));

    $scope.user = UserService.getCurrentUser();

    $scope.reset = function () {
        $scope.user.clearValidationResults();
        for (var key in $scope.forms) {
            if (!$scope.forms[key].$pristine) {
                $scope.forms[key].$setPristine();
            }
        }
        $scope.account = {
            email: '',
            password: ''
        };
        $scope.closeModal();
    };

    $scope.reset();

    /**
     * @ngdoc method
     * @name core.controller:AuthenticationController#$scope.login
     * @methodOf core.controller:AuthenticationController
     * @returns {void} returns void
     *
     * @description
     *  The login method deletes the default 'appConfig.roleAnonymous' and its specific token based on user role found in
     *  user credentials.
     */
    $scope.login = function (page) {

        delete sessionStorage.token;
        delete sessionStorage.role;

        var path = '';

        if (typeof page != 'undefined') {
            path = "/" + location.pathname.split("/")[1] + "/" + page;
        } else {
            path = location.pathname;
        }

        if (appConfig.mockRole) {
            $window.open(appConfig.authService + "/token?referer=" + location.origin + path + "&mock=" + appConfig.mockRole, "_self");
        } else {
            $window.open(appConfig.authService + "/token?referer=" + location.origin + path, "_self");
        }

        UserService.fetchUser();

    };

    /**
     * @ngdoc method
     * @name core.controller:AuthenticationController#$scope.logout
     * @methodOf core.controller:AuthenticationController
     * @returns {void} returns void
     *
     * @description
     *  The logout method will delete the session storage token, will set the sessionStorage role to default 'appConfig.roleAnonymous' and will
     *  direct to the default home page
     */
    $scope.logout = function () {

        delete sessionStorage.token;
        sessionStorage.role = appConfig.anonymousRole;

        $scope.user.logout();

        UserService.fetchUser();

        angular.element(".dropdown").dropdown("toggle");

        $location.path('/');

    };

});
