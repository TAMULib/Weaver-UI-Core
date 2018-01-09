core.service("RequestUtil", function () {

    var requestUtils = this;

    requestUtils.prepareRequest = function(request, manifest) {

        var apiReq = angular.copy(request);

        if (manifest && manifest.pathValues) {
            for (var key in manifest.pathValues) {
                var value = manifest.pathValues[key];
                apiReq.method = apiReq.method.replace(new RegExp(':' + key, 'g'), value);
            }
        }

        if (manifest && manifest.data) {
          apiReq.data = manifest.data;
        }

        if(manifest && manifest.file) {
            apiReq.file = manifest.file;
        }

        if (manifest && manifest.query) {
          apiReq.query = manifest.query;
        }

        if(manifest && manifest.method) {
            apiReq.httpMethod = manifest.method;
        }
        
        return apiReq;

    };

    requestUtils.buildUrl = function(req) {
        var url = typeof req === 'string' ? req : appConfig.webService + "/" + req.controller + "/" + req.method;
        if (req.query) {
          url += "?";
          for(var key in req.query) {
            if(req.query.hasOwnProperty(key)) {
              url += key + "=" + req.query[key] + "&";
            }
          }
          url = url.substring(0, url.length - 1);
        }
        return url;
    };


});
