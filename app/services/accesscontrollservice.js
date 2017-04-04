core.service("AccessControllService", function ($location, StorageService) {

    var AccessControllService = this;

    AccessControllService.lastRoutePath = ""

    AccessControllService.checkRoute = function (evt, next, current) {

        if (typeof (current) != "undefined" && typeof (current.$$route) != "undefined") {
            AccessControllService.lastRoutePath = current.$$route.originalPath;
            if (AccessControllService.lastRoutePath.indexOf('/') === 0) {
                AccessControllService.lastRoutePath = AccessControllService.lastRoutePath.replace('/', '');
            }
        }

        if (!next.$$route) return;

        var allowedUsers = next.$$route.access;
        var role = StorageService.get("role");

        var restrict = allowedUsers ? allowedUsers.indexOf(role) == -1 : false;

        if (restrict) {
            evt.preventDefault();
            $location.path("/error/403");
        }

    };

    AccessControllService.getLastRoutePath = function () {
        return AccessControllService.lastRoutePath
    }

});
