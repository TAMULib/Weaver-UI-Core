/**
 * @ngdoc service
 * @name  core.service:RestApi
 * @requires ng.$http
 * @requires ng.$window
 * @requires core.service:AuthService
 *
 * @description
 * 	The RestApi Service facilitates all restful communication
 * 	with a Spring implementation of the TAMU Webservice Core.
 * 	This is service is the http counterpart to the websocket
 * 	functionality of WsApi.
 *
 */
core.service("RestApi", function ($http, $window, AlertService, AuthService) {

    /**
     * @ngdoc property
     * @name core.service:RestApi#webservice
     * @propertyOf core.service:RestApi
     *
     * @description
     * 	A private reference to the application's configuration
     * 	for webService.
     *
     */
    var webservice = appConfig.webService;

    /**
     * @ngdoc property
     * @name core.service:RestApi#authService
     * @propertyOf core.service:RestApi
     *
     * @description
     * 	A private reference to the application's configuration
     * 	for authService.
     *
     */
    var authservice = appConfig.authService;

    /**
     * @ngdoc method
     * @name core.service:RestApi#anonymousGet
     * @methodOf core.service:RestApi
     *
     * @param {object} req
     * 	a request object
     * @returns {Promise} returns a promise
     *
     * @description
     *	Initiates a get request on behalf of a user whose role is 'ROLE_ANONYMOUS'.
     */
    this.anonymousGet = function (req) {

        var url = appConfig.webService + "/" + req.controller + "/" + req.method;

        var data = req.data !== undefined ? JSON.stringify(req.data) : '{}';

        return $http({
            method: 'GET',
            url: url,
            headers: {
                'data': data
            }
        }).then(
            //success callback
            function (response) {
                return response.data;
            },
            //error callback
            function (response) {
                return response.data;
            });
    };

    /**
     * @ngdoc method
     * @name core.service:RestApi#anonymousPost
     * @methodOf core.service:RestApi
     *
     * @param {object} req
     * 	a request object
     * @returns {Promise} returns a promise
     *
     * @description
     *	Initiates a post request on behalf of a user whose role is 'ROLE_ANONYMOUS'.
     */
    this.anonymousPost = function (req) {

        var url = appConfig.webService + "/" + req.controller + "/" + req.method;

        var data = req.data !== undefined ? JSON.stringify(req.data) : '{}';

        return $http({
            method: 'POST',
            url: url,
            data: data
        }).then(
            //success callback
            function (response) {
                return response.data;
            },
            //error callback
            function (response) {
                return response.data;
            });
    };

    /**
     * @ngdoc method
     * @name core.service:RestApi#get
     * @methodOf core.service:RestApi
     * @param {object} req a request object
     * @param {boolean=} isUrl a boolean
     * @returns {Promise} returns a promise
     *
     * @description
     *	Initiates a get request to the configured web service on behalf of an authenticated user.
     */
    this.get = function (req, isUrl) {

        var url = isUrl ? req : appConfig.webService + "/" + req.controller + "/" + req.method;

        var restObj = {
            method: 'GET',
            url: url,
            headers: {
                'jwt': sessionStorage.token,
                'X-Requested-With': undefined
            }
        };

        return $http(restObj).then(
            //success callback
            function (response) {
                return response.data;
            },
            //error callback
            function (response) {
                if (response.data.code === "EXPIRED_JWT") {

                    if (sessionStorage.assumedUser) {

                        return AuthService.getAssumedUser(JSON.parse(sessionStorage.assumedUser)).then(function () {
                            restObj.headers.jwt = sessionStorage.token;
                            return $http(restObj).then(function (response) {
                                return response.data;
                            });
                        });

                    } else {

                        return AuthService.getRefreshToken().then(function () {
                            restObj.headers.jwt = sessionStorage.token;
                            return $http(restObj).then(function (response) {
                                return response.data;
                            });
                        });

                    }

                } else {
                    $window.location.replace(authservice + "/token?referer=" + window.location);
                }
            });
    };

    /**
     * @ngdoc method
     * @name core.service:RestApi#post
     * @methodOf core.service:RestApi
     * @param {object} req a request object
     * @returns {Promise} returns a promise
     *
     * @description
     *	Initiates a post request to the configured web service on behalf of an authenticated user.
     */
    this.post = function (req) {

        var url = appConfig.webService + "/" + req.controller + "/" + req.method;

        var data = req.data !== undefined ? JSON.stringify(req.data) : '{}';

        var headers = {
            'jwt': sessionStorage.token,
            'X-Requested-With': undefined
        };

        var restObj = {
            method: 'POST',
            url: url,
            data: data,
            headers: headers
        };

        return $http(restObj).then(

            //success callback
            function (response) {
                console.log(response);
                AlertService.add(response.data.meta, response.config.url.replace(appConfig.webService + "/", ""));
                return response.data;
            },

            //error callback
            function (response) {
                if (response.data.code === "EXPIRED_JWT") {

                    if (sessionStorage.assumedUser) {

                        return AuthService.getAssumedUser(JSON.parse(sessionStorage.assumedUser)).then(function () {
                            restObj.headers.jwt = sessionStorage.token;
                            return $http(restObj).then(function (response) {
                                return response.data;
                            });
                        });

                    } else {

                        return AuthService.getRefreshToken().then(function () {
                            restObj.headers.jwt = sessionStorage.token;
                            return $http(restObj).then(function (response) {
                                return response.data;
                            });
                        });

                    }

                } else {
                    $window.location.replace(authservice + "/token?referer=" + window.location);
                }
            });
    };

});
