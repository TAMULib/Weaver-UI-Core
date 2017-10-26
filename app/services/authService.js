/**
 * @ngdoc service
 * @name  core.service:AuthService
 * @requires ng.$http
 * @requires ng.$timeout
 * @requires core.service:StorageService
 *
 * @description
 *  The service which handles all communication with the Authorization webservice.
 *
 */
core.service("AuthService", function ($http, $timeout, StorageService) {

    var AuthService = this;

    /**
     * @ngdoc method
     * @name core.service:AuthService#getAssumedUser
     * @methodOf core.service:AuthService
     * @param {object} assume
     *  Object containing information about the assumed user.
     *
     * @description
     *  A request to the Auth webservice for an assumed user.
     *
     */
    AuthService.getAssumedUser = function (assume, cb) {
        if (!AuthService.pendingRefresh) {
            var url = appConfig.authService + "/admin?netid=" + assume.netid;
            AuthService.pendingRefresh = $http.get(url, {
                'Accept': 'application/json, text/plain'
            }).then(function (response) {
                if (response.data.meta.status === 'SUCCESS') {
                    sessionStorage.token = response.data.payload.String;
                } else {
                    console.log(response.data);
                }

                // This timeout ensures that pending request is not nulled to early
                $timeout(function () {
                    delete AuthService.pendingRefresh;
                }, 50);

                if (cb) cb();
                return response;
            });
        }
        return AuthService.pendingRefresh;
    };

    /**
     * @ngdoc method
     * @name core.service:AuthService#getRefreshToken
     * @methodOf core.service:AuthService
     * @param {function} cb
     *  A callback
     *
     * @description
     *  A request for a refresh token.
     *
     */
    AuthService.getRefreshToken = function (cb) {
        if (!AuthService.pendingRefresh) {
            var url = appConfig.authService + "/refresh";

            if (sessionStorage.token !== undefined) {
                url += "?token=" + sessionStorage.token;
            }

            AuthService.pendingRefresh = $http.get(url, {
                'Accept': 'application/json, text/plain'
            }).then(function (response) {

                if (response.data.meta.status === 'SUCCESS') {
                    sessionStorage.token = response.data.payload.String;
                } else {
                    console.log(response.data);
                }

                // This timeout ensures that pending request is not nulled to early
                $timeout(function () {
                    delete AuthService.pendingRefresh;
                }, 50);

                if (cb) cb();
            }, function (error) {
                console.log(error);
                delete sessionStorage.token;

                if (appConfig.mockRole) {
                    window.open(appConfig.authService + "/token?referer=" + location.href + "&mock=" + appConfig.mockRole, "_self");
                } else {
                    window.open(appConfig.authService + "/token?referer=" + location.href, "_self");
                }
            });
        }
        return AuthService.pendingRefresh;
    };

});
