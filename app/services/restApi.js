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
core.service("RestApi", function ($http, $window, AlertService, AuthService, HttpMethodVerbs, RequestUtil) {

  var restApi = this;

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
    restApi.anonymousGet = function (req) {

      var url = WsApi.buildUrl(req);

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
                console.log(error);
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
                AlertService.add(response.data.meta, response.config.url.replace(appConfig.webService + "/", ""));
                return response.data;
            },
            // error callback
            function (error) {
                console.log(error);
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
    restApi.get = function (req) {
      return restApi.makeReq(req, HttpMethodVerbs.GET);
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
    restApi[HttpMethodVerbs.POST] = restApi.post;
    restApi[HttpMethodVerbs.PUT] = restApi.put;
    restApi[HttpMethodVerbs.DELETE] = restApi.delete;

    restApi.makeReq = function(req, method) {
      var url = RequestUtil.buildUrl(req);
      
      var data = req.data !== undefined ? req.data : {};

      var headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain'
      };

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
                          restObj.headers.jwt = sessionStorage.token;
                          return $http(restObj).then(function (response) {
                              return response.data;
                          });
                      });
                  }
              }
              AlertService.add(response.data.meta, response.config.url.replace(appConfig.webService + "/", ""));
              return response.data;
          },
          //error callback
          function (error) {
              console.log(error);
              return error.data;
          });
    } 

});
