core.run(function ($rootScope, AccessControllService) {

    angular.element("body").fadeIn(300);
    // Add runtime tasks here

    $rootScope.$on("$routeChangeStart", function (evt, next, current) {
        AccessControllService.checkRoute(evt, next, current);
    });

});
