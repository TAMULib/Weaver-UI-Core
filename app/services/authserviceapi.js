/**
 * @ngdoc service
 * @name  core.service:AuthServiceApi
 * @requires ng.$http
 * @requires ng.$timeout
 * @requires core.service:StorageService
 *
 * @description
 *  The service which handles all communication with the Authorization webservice.
 *
 */
core.service("AuthServiceApi", function ($http, $timeout, StorageService) {

    var AuthServiceApi = this;

    /**
     * @ngdoc method
     * @name core.service:AuthServiceApi#getAssumedUser
     * @methodOf core.service:AuthServiceApi
     * @param {object} assume
     *  Object containing information about the assumed user.
     *
     * @description
     *  A request to the Auth webservice for an assumed user.
     *
     */
    AuthServiceApi.getAssumedUser = function (assume, cb) {
        if (!AuthServiceApi.pendingRefresh) {
            AuthServiceApi.pendingRefresh = $http.get(appConfig.authService + "/admin?netid=" + assume.netid, {
                withCredentials: true,
                headers: {
                    'X-Requested-With': undefined
                }
            }).then(function (response) {

                if (response.data.assumed) {
                    StorageService.set('token', response.data.assumed.tokenAsString);
                }

                // This timeout ensures that pending request is not nulled to early
                $timeout(function () {
                    delete AuthServiceApi.pendingRefresh;
                }, 50);

                if (cb) cb();
                return response;
            });
        }
        return AuthServiceApi.pendingRefresh;
    };

    /**
     * @ngdoc method
     * @name core.service:AuthServiceApi#getRefreshToken
     * @methodOf core.service:AuthServiceApi
     * @param {function} cb
     *  A callback
     *
     * @description
     *  A request for a refresh token.
     *
     */
    AuthServiceApi.getRefreshToken = function (cb) {
        if (!AuthServiceApi.pendingRefresh) {

            var url = appConfig.authService + "/refresh";

            if (typeof sessionStorage.token != null) {
                url += "?token=" + sessionStorage.token;
            } else {
                if (appConfig.mockRole) {
                    url += "?mock=" + appConfig.mockRole;
                }
            }

            AuthServiceApi.pendingRefresh = $http.get(url, {
                withCredentials: true,
                headers: {
                    'X-Requested-With': undefined
                }
            }).then(function (response) {

                sessionStorage.token = response.data.tokenAsString;

                // This timeout ensures that pending request is not nulled to early
                $timeout(function () {
                    delete AuthServiceApi.pendingRefresh;
                }, 50);

                if (cb) cb();
            }, function (response) {

                delete sessionStorage.token;

                if (appConfig.mockRole) {
                    window.open(appConfig.authService + "/token?referer=" + location.href + "&mock=" + appConfig.mockRole, "_self");
                } else {
                    window.open(appConfig.authService + "/token?referer=" + location.href, "_self");
                }
            });
        }
        return AuthServiceApi.pendingRefresh;
    };

});
