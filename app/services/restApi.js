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
core.service("RestApi", function ($http, AlertService, AuthService, HttpMethodVerbs) {

    var restApi = this;

    /**
     * @ngdoc method
     * @name core.service:RestApi#buildUrl
     * @methodOf core.service:RestApi
     * @private
     *
     * @param {object|string} req
     *  A request object or a string representing the URL.
     *  - If an object, it should contain:
     *    - `controller` {string} The name of the controller.
     *    - `method` {string} (optional) The method to be called on the controller.
     *    - `query` {object} (optional) An object representing query parameters.
     * @returns {string} The constructed URL.
     *
     * @description
     * Constructs a URL based on the provided request object or string.
     */
    var buildUrl = function (req) {
        var url = typeof req === 'string' ? req : appConfig.webService + "/" + req.controller + (req.method ? "/" + req.method : "");
        if (req.query) {
            url += "?";
            for (var key in req.query) {
                if (req.query.hasOwnProperty(key)) {
                    url += key + "=" + req.query[key] + "&";
                }
            }
            url = url.substring(0, url.length - 1);
        }
        return url;
    };

    /**
     * @ngdoc method
     * @name core.service:RestApi#getMeta
     * @methodOf core.service:RestApi
     * @private
     *
     * @param {object} response
     *  The HTTP response object.
     * @returns {object} The meta information extracted from the response.
     *
     * @description
     * Extracts meta information from the HTTP response object.
     */
    var getMeta = function (response) {
        return !!response.data.meta ? response.data.meta
            : { status: response.statusText, message: 'Request was successful' };
    };

    /**
     * @ngdoc method
     * @name core.service:RestApi#handleError
     * @methodOf core.service:RestApi
     * @private
     *
     * @param {object} error
     *  The error object from the HTTP response.
     * @returns {object} An object containing meta information and the error payload.
     *
     * @description
     * Handles errors by adding an alert and returning an error object.
     */
    var handleError = function (error) {
        AlertService.addAlertServiceError(error);
        return {
            meta: {
                status: 'ERROR'
            },
            payload: error.data
        };
    };

    /**
     * @ngdoc method
     * @name core.service:RestApi#anonymousGet
     * @methodOf core.service:RestApi
     *
     * @param {object} req
     *  A request object containing the following properties:
     *  - `controller` {string} The name of the controller.
     *  - `method` {string} (optional) The method to be called on the controller.
     *  - `query` {object} (optional) An object representing query parameters.
     *  - `data` {object} (optional) Data to be sent with the request.
     *  - `skipErrorHandling` {boolean} (optional) If true, skips the default error handling.
     * @returns {Promise} Returns a promise that resolves with the response data.
     *
     * @description
     * Initiates a GET request on behalf of a user whose role is 'ROLE_ANONYMOUS'.
     */
    restApi.anonymousGet = function (req) {

        var url = buildUrl(req);

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
                AlertService.add(getMeta(response), response.config.url.replace(appConfig.webService + "/", ""));
                return response.data;
            },
            // error callback
            function (error) {
                return req.skipErrorHandling
                    ? Promise.reject(error)
                    : handleError(error);
            }
        );
    };

    /**
     * @ngdoc method
     * @name core.service:RestApi#anonymousPost
     * @methodOf core.service:RestApi
     *
     * @param {object} req
     *  A request object containing the following properties:
     *  - `controller` {string} The name of the controller.
     *  - `method` {string} (optional) The method to be called on the controller.
     *  - `query` {object} (optional) An object representing query parameters.
     *  - `data` {object} (optional) Data to be sent with the request.
     *  - `skipErrorHandling` {boolean} (optional) If true, skips the default error handling.
     * @returns {Promise} returns a promise
     *
     * @description
     * Initiates a POST request on behalf of a user whose role is 'ROLE_ANONYMOUS'.
     */
    restApi.anonymousPost = function (req) {

        var url = buildUrl(req);

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
                AlertService.add(getMeta(response), response.config.url.replace(appConfig.webService + "/", ""));
                return response.data;
            },
            // error callback
            function (error) {
                return req.skipErrorHandling
                    ? Promise.reject(error)
                    : handleError(error);
            }
        );
    };

    /**
     * @ngdoc method
     * @name core.service:RestApi#get
     * @methodOf core.service:RestApi
     * @param {object} req
     *  A request object containing the following properties:
     *  - `controller` {string} The name of the controller.
     *  - `method` {string} (optional) The method to be called on the controller.
     *  - `query` {object} (optional) An object representing query parameters.
     *  - `data` {object} (optional) Data to be sent with the request.
     *  - `skipErrorHandling` {boolean} (optional) If true, skips the default error handling.
     * @returns {Promise} returns a promise
     *
     * @description
     * Initiates a GET request to the configured web service on behalf of an authenticated user.
     */
    restApi.get = function (req) {
        return restApi.makeReq(req, HttpMethodVerbs.GET);
    };

    restApi.patch = function (req) {
        return restApi.makeReq(req, HttpMethodVerbs.PATCH);
    };

    /**
     * @ngdoc method
     * @name core.service:RestApi#post
     * @methodOf core.service:RestApi
     * @param {object} req
     *  A request object containing the following properties:
     *  - `controller` {string} The name of the controller.
     *  - `method` {string} (optional) The method to be called on the controller.
     *  - `query` {object} (optional) An object representing query parameters.
     *  - `data` {object} (optional) Data to be sent with the request.
     *  - `skipErrorHandling` {boolean} (optional) If true, skips the default error handling.
     * @returns {Promise} returns a promise
     *
     * @description
     * Initiates a POST request to the configured web service on behalf of an authenticated user.
     */
    restApi.post = function (req) {
        return restApi.makeReq(req, HttpMethodVerbs.POST);
    };

    restApi.put = function (req) {
        return restApi.makeReq(req, HttpMethodVerbs.PUT);
    };

    restApi.delete = function (req) {
        return restApi.makeReq(req, HttpMethodVerbs.DELETE);
    };

    restApi[HttpMethodVerbs.GET] = restApi.get;
    restApi[HttpMethodVerbs.PATCH] = restApi.patch;
    restApi[HttpMethodVerbs.POST] = restApi.post;
    restApi[HttpMethodVerbs.PUT] = restApi.put;
    restApi[HttpMethodVerbs.DELETE] = restApi.delete;

    restApi.makeReq = function (req, method) {
        var url = buildUrl(req);

        var data = req.data !== undefined ? req.data : {};

        var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain'
        };

        if (req.headers) {
            angular.forEach(req.headers, function (hv, h) {
                headers[h] = hv;
            });
        }

        if (sessionStorage.token) {
            headers.jwt = sessionStorage.token;
        }

        var restObj = {
            method: method,
            url: url,
            data: data,
            headers: headers
        };

        return $http(restObj).then(
            // success callback
            function (response) {
                if (!!response.data.meta && response.data.meta.status === 'REFRESH') {
                    if (sessionStorage.assumedUser) {
                        return AuthService.getAssumedUser(angular.fromJson(sessionStorage.assumedUser)).then(function () {
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
                }
                AlertService.add(getMeta(response), response.config.url.replace(appConfig.webService + "/", ""));
                return response.data;
            },
            // error callback
            function (error) {
                return req.skipErrorHandling
                    ? Promise.reject(error)
                    : handleError(error);
            }
        );
    };

});