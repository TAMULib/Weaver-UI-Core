core.service("AccessControlService", function ($location, StorageService) {

    var AccessControlService = this;

    AccessControlService.lastRoutePath = "";

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

        var authorizeUrl = StorageService.get("post_authorize_url");

        if (role == 'ROLE_ANONYMOUS' && (allowedUsers !== undefined)) {
            StorageService.set("post_authorize_url", $location.path());
            $location.path("/error/401");
        } else if (authorizeUrl && $location.path() != "/error/401") {
            StorageService.delete("post_authorize_url");
            $location.path(authorizeUrl);
        } else if (restrict) {
            evt.preventDefault();
            $location.path("/error/403");
        }

    };

    AccessControlService.getLastRoutePath = function () {
        return AccessControlService.lastRoutePath;
    };

});