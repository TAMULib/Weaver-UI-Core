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

        var data = req.data !== undefined ? angular.toJson(req.data) : '{}';

        return $http({
            method: 'GET',
            url: url,
            headers: {
                data: data,
                'Accept': 'application/json, text/plain'
            }
        }).then(
            // success callback
            function (response) {
                AlertService.add(response.data.meta, response.config.url.replace(appConfig.webService + "/", ""));
                return response.data;
            },
            // error callback
            function (error) {
                return error.data;
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

        var data = req.data !== undefined ? req.data : {};

        var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain'
        };

        return $http({
            method: 'POST',
            url: url,
            headers: headers,
            data: data
        }).then(
            // success callback
            function (response) {
                AlertService.add(response.data.meta, response.config.url.replace(appConfig.webService + "/", ""));
                return response.data;
            },
            // error callback
            function (error) {
                return error.data;
            });
    };

    /**
     * @ngdoc method
     * @name core.service:RestApi#get
     * @methodOf core.service:RestApi
     * @param {object} req a request object
     * @returns {Promise} returns a promise
     *
     * @description
     *	Initiates a get request to the configured web service on behalf of an authenticated user.
     */
    this.get = function (req) {

        var url = typeof req === 'string' ? req : appConfig.webService + "/" + req.controller + "/" + req.method;

        var data = req.data !== undefined ? angular.toJson(req.data) : '{}';

        var headers = {
            data: data,
            'Accept': 'application/json, text/plain'
        };

        if (sessionStorage.token) {
            headers.jwt = sessionStorage.token;
        }

        var restObj = {
            method: 'GET',
            url: url,
            headers: headers
        };
        console.log('before', sessionStorage.token);

        return $http(restObj).then(
            //success callback
            function (response) {
                if (response.data.meta.status === 'REFRESH') {
                    if (sessionStorage.assumedUser) {
                        return AuthService.getAssumedUser(angular.fromJson(sessionStorage.assumedUser)).then(function () {
                            restObj.headers.jwt = sessionStorage.token;
                            return $http(restObj).then(function (response) {
                                return response.data;
                            });
                        });
                    } else {
                        return AuthService.getRefreshToken().then(function () {
                            console.log('after', sessionStorage.token);
                            restObj.headers.jwt = sessionStorage.token;
                            return $http(restObj).then(function (response) {
                                return response.data;
                            });
                        });
                    }
                }
                console.log(response.data.meta.status, response.config.url, response);
                AlertService.add(response.data.meta, response.config.url.replace(appConfig.webService + "/", ""));
                return response.data;
            },
            //error callback
            function (error) {
                console.log(error);
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

        var data = req.data !== undefined ? req.data : {};

        var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain'
        };

        if (sessionStorage.token) {
            headers.jwt = sessionStorage.token;
        }

        var restObj = {
            method: 'POST',
            url: url,
            data: data,
            headers: headers
        };

        console.log('before', sessionStorage.token);

        return $http(restObj).then(
            //success callback
            function (response) {
                if (response.data.meta.status === 'REFRESH') {
                    if (sessionStorage.assumedUser) {
                        return AuthService.getAssumedUser(angular.fromJson(sessionStorage.assumedUser)).then(function () {
                            restObj.headers.jwt = sessionStorage.token;
                            return $http(restObj).then(function (response) {
                                return response.data;
                            });
                        });
                    } else {
                        return AuthService.getRefreshToken().then(function () {
                            console.log('after', sessionStorage.token);
                            restObj.headers.jwt = sessionStorage.token;
                            return $http(restObj).then(function (response) {
                                return response.data;
                            });
                        });
                    }
                }
                console.log(response.data.meta.status, response.config.url, response);
                AlertService.add(response.data.meta, response.config.url.replace(appConfig.webService + "/", ""));
                return response.data;
            },
            //error callback
            function (error) {
                console.log(error);
            });
    };

});