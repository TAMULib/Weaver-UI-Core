core.service("FileService", function ($http, $q, AlertService, AuthService, Upload) {

    /**
     * Handle and return $http error. Adds error alert.
     *
     * @param {*} error $http download error callback
     * @returns newly created ERROR ApiResponse from $http error
     */
    function handleAndReturn(error) {
        console.error(error);
        AlertService.addAlertServiceError(error);

        return {
            meta: {
                status: 'ERROR',
                message: error.data?.message || 'An unknown error occurred.'
            },
            payload: error.data
        };
    };

    /**
     * Return download data.
     *
     * @param {*} response successful callback from $http download
     * @returns response.data
     */
    function processDownload(response) {
        return response.data;
    };

    /**
     * Process error response.
     *
     * @param {*} error error callback from $http download
     * @returns promise with error handled
     */
    function processDownloadError(error) {
        if (error.data instanceof Blob) {
            // Use the blob's text() method which returns a promise
            return error.data.text().then(result => {
                try {
                    const apiResponse = JSON.parse(result);
                    error.data.message = apiResponse.meta.message;
                } catch (e) {
                    console.log(e);
                }

                return handleAndReturn(error)
            });
        } else {
            return Promise.resolve(handleAndReturn(error));
        }
    };

    this.anonymousDownload = function (req) {

        var url = appConfig.webService + "/" + req.controller + "/" + req.method;

        var headers = req.data !== undefined ? req.data : {};

        return $http({
            method: 'GET',
            url: url,
            headers: headers,
            responseType: 'blob'
        }).then(
            // success callback
            processDownload,
            // error callback
            processDownloadError
        );
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
    };

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
            responseType: 'blob'
        };

        // Since there is no reasonable way to get the meta status from an blob response we must refresh token first.
        // This will ensure the token is not expired. The correct solution to this would be to use proper status codes rather
        // than indicating 200 for all responses and encoding status in meta of the response!!!
        if (sessionStorage.assumedUser) {
            return AuthService.getAssumedUser(angular.fromJson(sessionStorage.assumedUser)).then(function () {
                restObj.headers.jwt = sessionStorage.token;
                return $http(restObj).then(
                    // success callback
                    processDownload,
                    // error callback
                    processDownloadError
                );
            });
        } else {
            return AuthService.getRefreshToken().then(function () {
                restObj.headers.jwt = sessionStorage.token;

                

                return $http(restObj).then(
                    // success callback
                    processDownload,
                    // error callback
                    processDownloadError
                );
            });
        }
    };

    this.upload = function (req) {

        var url = appConfig.webService + "/" + req.controller + "/" + req.method;

        var headers = {};

        if (sessionStorage.token) {
            headers.jwt = sessionStorage.token;
        }

        var data = {
            file: req.file
        };

        angular.extend(data, req.data);

        return attemptUpload({
            url: url,
            data: data,
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
            AlertService.addAlertServiceError(error);
            defer.reject({
                meta: {
                    status: 'ERROR'
                },
                payload: error.data
            });
        }, function (event) {
            defer.notify(parseInt(100.0 * event.loaded / event.total));
        });

        return defer.promise;
    };

});
