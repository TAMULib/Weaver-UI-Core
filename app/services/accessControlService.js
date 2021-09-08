core.service("AccessControlService", function ($location, StorageService, UserService) {

    var AccessControlService = this;

    AccessControlService.lastRoutePath = "";

    AccessControlService.checkRoute = function (evt, next, current) {

        if (current !== undefined && current.$$route !== undefined) {
            AccessControlService.lastRoutePath = current.$$route.originalPath;
            if (AccessControlService.lastRoutePath.indexOf('/') === 0) {
                AccessControlService.lastRoutePath = AccessControlService.lastRoutePath.replace('/', '');
            }
        }

        if (!next.$$route) return;

        var allowedUsers = next.$$route.access;

        if(allowedUsers === undefined) return;

        var role;

        UserService.userReady().then(function() {
            UserService.getCurrentUser();
            role = StorageService.get("role");
        }).then(function() {
            var restrict = allowedUsers.indexOf(role) < 0;

            var authorizeUrl = StorageService.get("post_authorize_url");

            if (role === 'ROLE_ANONYMOUS') {
                StorageService.set("post_authorize_url", window.location.pathname);
                $location.path("/error/401");
            } else if (authorizeUrl && $location.path() !== "/error/401") {
                StorageService.delete("post_authorize_url");
            } else if (restrict) {
                evt.preventDefault();
                $location.path("/error/403");
            }
        });
    };

    AccessControlService.getLastRoutePath = function () {
        return AccessControlService.lastRoutePath;
    };

});