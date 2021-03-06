/**
 * @ngdoc service
 * @name  core.service:AuthService
 * @requires ng.$http
 * @requires ng.$timeout
 *
 * @description
 *  The service which handles all communication with the Authorization webservice.
 *
 */
core.service("AuthService", function ($http, $timeout) {

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
        var url = appConfig.webService + "/assume?netid=" + assume.netid;
        return $http.get(url, {
            headers: {
                jwt: sessionStorage.token,
                'Accept': 'application/json, text/plain'
            }
        }).then(function (response) {

            if (response.data.meta.status === 'REFRESH') {

                return AuthService.getRefreshToken().then(function () {
                    return AuthService.getAssumedUser(assume, cb);
                });

            } else {

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
            }
        });
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

                // NOTE: duplicated in setup.js
                /*------------------------------------------------------------------------*/
                var referrer = location.href;
                if (location.href.indexOf('?') >= 0) {
                    var parts = location.href.split('?');
                    referrer = parts[0] + '?' + encodeURIComponent(parts[1]);
                }
                if (appConfig.mockRole) {
                    referrer += "&mock=" + appConfig.mockRole;
                }
                window.open(appConfig.authService + "/token?referrer=" + referrer, "_self");
                /*------------------------------------------------------------------------*/
            });
        }
        return AuthService.pendingRefresh;
    };

});
