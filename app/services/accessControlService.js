core.service("AccessControlService", function ($location, $timeout, StorageService, UserService) {

    var AccessControlService = this;

    AccessControlService.isAuthenticated = false;

    AccessControlService.lastRoutePath = "";

    UserService.userEvents().then(null, null, function () {
        AccessControlService.isAuthenticated = true;
    });

    AccessControlService.checkRoute = function (evt, next, current) {

        if (current !== undefined && current.$$route !== undefined) {
            AccessControlService.lastRoutePath = current.$$route.originalPath;
            if (AccessControlService.lastRoutePath.indexOf('/') === 0) {
                AccessControlService.lastRoutePath = AccessControlService.lastRoutePath.replace('/', '');
            }
        }

        if (!next.$$route) return;

        var allowedUsers = next.$$route.access;

        if (allowedUsers === undefined) return;

        var process = function () {
            var role = StorageService.get("role");

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
        };

        $timeout(() => {
            if (AccessControlService.isAuthenticated) {
                UserService.userReady().then(function () {
                    UserService.getCurrentUser();
                    process();
                });
            } else {
                process();
            }
        });
    };

    AccessControlService.getLastRoutePath = function () {
        return AccessControlService.lastRoutePath;
    };

});