core.factory("AbstractModel", function($rootScope, $q, $sanitize, $timeout, WsApi, ValidationStore) {

    return function AbstractModel() {

        var abstractModel;

        var mapping;

        var defer = $q.defer();

        var listenCallbacks = [];

        var shadow = {};

        var entityName;

        var validations;

        var validationResults = {};

        $rootScope.$on("$locationChangeSuccess", function() {
            listenCallbacks.length = 0;
        });

        this.fetch = function() {
            if (mapping.instantiate !== undefined) {
                WsApi.fetch(mapping.instantiate).then(function(res) {
                    processResponse(res);
                    listen();
                });
            }
        }

        this.init = function(data, apiMapping) {

            abstractModel = this;

            entityName = abstractModel.constructor.name;

            validations = ValidationStore.getValidations(entityName);

            mapping = apiMapping;

            if (data) {
                setData(data);
            } else {
                if (!mapping.lazy) {
                    this.fetch();
                }
            }

        };

        this.getEntityName = function() {
            return entityName;
        };

        this.getValidations = function() {
            return validations;
        };

        this.getMapping = function() {
            return mapping;
        };

        this.ready = function() {
            return defer.promise;
        };

        this.save = function() {
            var promise = $q(function(resolve) {
                if (abstractModel.dirty()) {
                    angular.extend(mapping.update, {
                        data: abstractModel
                    });
                    console.log(mapping.update)
                    WsApi.fetch(mapping.update).then(function(res) {
                        resolve(res);
                    });
                } else {
                    var payload = {};
                    payload[abstractModel.constructor.name] = abstractModel;
                    resolve({
                        body: angular.toJson({
                            payload: payload,
                            meta: {
                                type: "SUCCESS"
                            }
                        })
                    });
                }
            });
            promise.then(function(res) {
                if (angular.fromJson(res.body).meta.type != "INVALID") {
                    angular.extend(abstractModel, angular.fromJson(res.body).payload);
                    shadow = angular.copy(abstractModel);
                    console.log(abstractModel);
                }
            });
            return promise;
        };

        this.delete = function() {
            angular.extend(mapping.remove, {
                data: abstractModel
            });
            var promise = WsApi.fetch(mapping.remove);
            promise.then(function(res) {
                if (angular.fromJson(res.body).meta.type == "INVALID") {
                    angular.extend(abstractModel, angular.fromJson(res.body).payload);
                    console.log(abstractModel);
                }
            });
            return promise;
        };

        this.listen = function(cb) {
            listenCallbacks.push(cb);
        };

        this.refresh = function() {
            angular.extend(abstractModel, shadow);
        };

        this.dirty = function() {
            return angular.toJson(abstractModel) !== angular.toJson(shadow);
        };

        this.setValidationResults = function(results) {
            angular.extend(validationResults, results);
        };

        this.getValidationResults = function() {
            return validationResults;
        };

        this.clearValidationResults = function() {
            if (validationResults.messages !== undefined) {
                delete validationResults.messages;
            }
        };

        this.update = function(data) {
            angular.extend(abstractModel, data);
            shadow = angular.copy(abstractModel);
        };

        var setData = function(data) {
            angular.extend(abstractModel, data);
            shadow = angular.copy(abstractModel);
            defer.resolve();
        };

        var listen = function() {

            if (abstractModel.id && mapping.listen) {
                angular.extend(mapping.listen, {
                    method: "/" + abstractModel.id
                });
                var notifyPromise = WsApi.listen(mapping.listen);
                notifyPromise.then(null, null, function(res) {
                    processResponse(res);
                    angular.forEach(listenCallbacks, function(cb) {
                        cb(res);
                    });
                });
                return notifyPromise;
            }

        };

        var processResponse = function(res) {

            var resObj = angular.fromJson(res.body);

            var meta = resObj.meta;

            if (meta.type != 'ERROR') {
                var payload = resObj.payload;

                angular.forEach(payload, function(datum) {
                    angular.extend(abstractModel, datum);
                });

                setData(abstractModel);
            } else {
                abstractModel.refresh();
            }

        };

        // additional core level model methods and variables

        return this;

    };

});
