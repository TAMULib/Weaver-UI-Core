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
              withCredentials: true,
              headers: {
                  'X-Requested-With': undefined
              }
            }).then(function (response) {

                if (response.data.meta.status === 'SUCCESS' && response.data.payload.String !== undefined) {
                    sessionStorage.token = response.data.payload.String;
                } else {
                    console.error('unable to get token from response', response);
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
              withCredentials: true,
              headers: {
                  'X-Requested-With': undefined
              }
            }).then(function (response) {

                if (response.data.meta.status === 'SUCCESS' && response.data.payload.String !== undefined) {
                    sessionStorage.token = response.data.payload.String;
                } else {
                    console.error('unable to get token from response', response);
                }

                // This timeout ensures that pending request is not nulled to early
                $timeout(function () {
                    delete AuthService.pendingRefresh;
                }, 50);

                if (cb) cb();
            }, function (error) {
                console.log(error);
                delete sessionStorage.token;

                var referer = location.href;

                if(location.href.indexOf('?') >= 0) {
                    var parts = location.href.split('?');
                    referer = parts[0] + encodeURIComponent(parts[1]);
                }

                if (appConfig.mockRole) {
                    referer +=  "&mock=" + appConfig.mockRole;
                }

                console.log(referer);

                window.open(appConfig.authService + "/token?referer=" + referer, "_self");
            });
        }
        return AuthService.pendingRefresh;
    };

});
