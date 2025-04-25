core.service("FileService", function ($http, $q, AlertService, AuthService, Upload) {

    /**
     * Scans backwards from the last '}' in a string to find a well-formed JSON object,
     * but only examines up to `maxScanLength` characters for the opening '{'.
     * If the entire text is valid JSON, this function rejects so you can handle it
     * in your error block instead of treating it as embedded JSON.
     *
     * @param {string} str
     * @param {number} maxScanLength  // maximum number of chars to scan backwards
     * @returns {Promise<any>}
     */
    function findEmbeddedJSON(str, maxScanLength) {
        return new Promise((resolve, reject) => {
            // 1) Locate the last closing brace
            const end = str.lastIndexOf('}');
            if (end === -1) {
                return reject('No closing "}" found in string');
            }

            // 2) If full text is valid JSON, reject immediately
            try {
                JSON.parse(str);
                return reject('Full text is valid JSON; no embedded extraction needed');
            } catch (_) {
                // not pure JSON → proceed to scan for embedded
            }

            // 3) Compute scanning window
            const scanLimit = Math.max(0, end - maxScanLength);
            let start = str.lastIndexOf('{', end);

            // 4) Walk backwards until we hit scanLimit
            while (start >= scanLimit) {
                const chunk = str.slice(start, end + 1);
                try {
                    const obj = JSON.parse(chunk);

                    return resolve(obj);
                } catch (_) {
                    start = str.lastIndexOf('{', start - 1);
                }
            }

            // 5) No embedded JSON found within the allowed window
            return reject(`No valid JSON found within the last ${maxScanLength} characters`);
        });
    };

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
     * Process download and check for any embedded JSON as an error.
     *
     * @param {*} response successful callback from $http download
     * @returns response.data unless containing embedded JSON
     */
    function processDownload(response) {
        if (response?.data instanceof Blob) {
            return response.data.text().then(text => {
                return findEmbeddedJSON(text, 5000)
                    .then(embedded => {
                        // return if embedded ApiResponse is not an ERROR
                        if (embedded?.meta?.status !== 'ERROR') {
                            return response.data;
                        }
                        // extracted embedded JSON → use its meta.message
                        response.data.message = embedded?.meta?.message;
                        // this is required because the status header has already
                        // been committed to the output stream
                        response.status = 500;

                        return handleAndReturn(response);
                    })
                    .catch(_ => {
                        // no embedded JSON extracted → continue with download
                        return response.data;
                    });
            });
        } else {
            // if not Blob return same as before
            return response.data;
        }
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
