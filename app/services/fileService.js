core.service("FileService", function ($http, $q, $window, AuthService, Upload, WsApi) {

    var webservice = appConfig.webService;

    var authservice = appConfig.authService;

    this.anonymousDownload = function (req) {

        var apiReq = WsApi.prepareRequest(req, manifest);

        var url = WsApi.buildUrl(apiReq);

        var headers = apiReq.data !== undefined ? apiReq.data : {};

        return $http({
            method: 'GET',
            url: url,
            headers: headers,
            responseType: 'arraybuffer'
        }).then(
            //success callback
            function (response) {
                return response.data;
            },
            //error callback
            function (error) {
                return error.data;
            });
    };

    this.anonymousUpload = function (req) {

        var apiReq = WsApi.prepareRequest(req, manifest);

        var url = WsApi.buildUrl(apiReq);

        return attemptAnonymousUpload({
            url: url,
            data: {
                file: apiReq.file ? apiReq.file : apiReq.data
            }
        }, $q.defer());
    };

    var attemptAnonymousUpload = function (uploadObj, defer) {
        Upload.upload(uploadObj).then(function (response) {
            defer.resolve(response);
        }, function (response) {
            defer.resolve(response);
        }, function (event) {
            defer.notify(parseInt(100.0 * event.loaded / event.total));
        });
        return defer.promise;
    }

    this.download = function (req) {

        var url = typeof req === 'string' ? req : appConfig.webService + "/" + req.controller + "/" + req.method;

        var headers = req.data !== undefined ? req.data : {};

        if (sessionStorage.token) {
            headers.jwt = sessionStorage.token;
        }

        var restObj = {
            method: 'GET',
            url: url,
            headers: headers,
            responseType: 'arraybuffer'
        };

        return $http(restObj).then(
            //success callback
            function (response) {
                if (response.data.meta !== undefined && response.data.meta.status === 'REFRESH') {
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
                return response.data;
            },
            //error callback
            function (error) {
                console.log(error);
                return error.data;
            });
    };

    this.upload = function (req) {

        var apiReq = WsApi.prepareRequest(req, manifest);

        var url = WsApi.buildUrl(apiReq);

        var headers = {};

        if (sessionStorage.token) {
            headers.jwt = sessionStorage.token;
        }

        return attemptUpload({
            url: url,
            data: {
                file: apiReq.file ? apiReq.file : apiReq.data
            },
            headers: headers
        }, $q.defer());
    };

    var attemptUpload = function (uploadObj, defer) {

        Upload.upload(uploadObj).then(function (response) {
            if (response.data.meta.status === 'REFRESH') {
                if (sessionStorage.assumedUser) {

                    return AuthService.getAssumedUser(angular.toJson(sessionStorage.assumedUser)).then(function () {
                        uploadObj.headers.jwt = sessionStorage.token;
                        attemptUpload(uploadObj, defer);
                    });

                } else {

                    return AuthService.getRefreshToken().then(function () {
                        uploadObj.headers.jwt = sessionStorage.token;
                        attemptUpload(uploadObj, defer);
                    });

                }
            }
            defer.resolve(response);
        }, function (error) {
            console.log(error);
            defer.reject(error);
        }, function (event) {
            defer.notify(parseInt(100.0 * event.loaded / event.total));
        });

        return defer.promise;
    }

});
