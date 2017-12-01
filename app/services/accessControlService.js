core.service("AccessControlService", function ($location, StorageService) {

    var AccessControlService = this;

    AccessControlService.lastRoutePath = ""

    AccessControlService.checkRoute = function (evt, next, current) {

        if (typeof (current) != "undefined" && typeof (current.$$route) != "undefined") {
            AccessControlService.lastRoutePath = current.$$route.originalPath;
            if (AccessControlService.lastRoutePath.indexOf('/') === 0) {
                AccessControlService.lastRoutePath = AccessControlService.lastRoutePath.replace('/', '');
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

    AccessControlService.getLastRoutePath = function () {
        return AccessControlService.lastRoutePath
    }

});
