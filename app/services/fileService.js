core.service("FileService", function ($http, $q, $window, AuthService, Upload) {

    var webservice = appConfig.webService;

    var authservice = appConfig.authService;

    this.anonymousDownload = function (req) {

        var url = appConfig.webService + "/" + req.controller + "/" + req.method;

        var headers = req.data !== undefined ? req.data : {};

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
        var url = appConfig.webService + "/" + req.controller + "/" + req.method;
        return attemptAnonymousUpload({
            url: url,
            data: {
                file: req.file
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

        // Since there is no reasonable way to get the meta status from an arraybuffer response we must refresh token first.
        // This will ensure the token is not expired. The correct solution to this would be to use proper status codes rather
        // than indicating 200 for all responses and encoding status in meta of the response!!!
        if (sessionStorage.assumedUser) {
            return AuthService.getAssumedUser(angular.fromJson(sessionStorage.assumedUser)).then(function () {
                restObj.headers.jwt = sessionStorage.token;
                return $http(restObj).then(function (response) {
                    return response.data;
                },
                //error callback
                function (error) {
                    console.log(error);
                    return error.data;
                });
            });
        } else {
            return AuthService.getRefreshToken().then(function () {
                restObj.headers.jwt = sessionStorage.token;
                return $http(restObj).then(function (response) {
                    return response.data;
                },
                //error callback
                function (error) {
                    console.log(error);
                    return error.data;
                });
            });
        }
    };

    this.upload = function (req) {

        var url = appConfig.webService + "/" + req.controller + "/" + req.method;

        var headers = {};

        if (sessionStorage.token) {
            headers.jwt = sessionStorage.token;
        }

        return attemptUpload({
            url: url,
            data: {
                file: req.file
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
