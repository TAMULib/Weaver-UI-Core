core.run(function ($rootScope, AccessControlService) {

    angular.element("body").fadeIn(300);
    // Add runtime tasks here

    $rootScope.$on("$routeChangeStart", function (evt, next, current) {
        AccessControlService.checkRoute(evt, next, current);
    });

});
