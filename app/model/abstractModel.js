core.factory("AbstractModel", function ($q, $rootScope, WsApi, ValidationStore, ModelCache, ModelUpdateService) {

    return function AbstractModel() {

        var abstractModel;

        var mapping;

        var entityName;

        var validations;

        var defer = $q.defer();

        var listenCallbacks = [];

        var shadow = {};

        var validationResults = {};

        var listening = false;

        var combinationOperation = 'extend';

        var beforeMethodBuffer = [];

        this.before = function (beforeMethod) {
            beforeMethodBuffer.push(beforeMethod);
        }

        this.fetch = function () {
            if (mapping.instantiate !== undefined) {

                var fetch = true;
                if (mapping.caching) {
                    var cachedModel = ModelCache.get(entityName);
                    if (cachedModel) {
                        setData(cachedModel);
                        fetch = false;
                    }
                }

                if (fetch) {
                    WsApi.fetch(mapping.instantiate).then(function (res) {
                        processResponse(res);
                    }, function (error) {
                        defer.reject(error);
                    });
                }

            }
        }

        this.init = function (data, apiMapping) {

            abstractModel = this;

            mapping = apiMapping;

            entityName = abstractModel.constructor.getName();

            if (mapping.validations) {
                validations = ValidationStore.getValidations(entityName);
            }

            if (data) {
                setData(data);
            } else {
                if (!mapping.lazy) {
                    this.fetch();
                }
            }
            angular.forEach(beforeMethodBuffer, function (beforeMethod) {
                beforeMethod();
            });
            this.ready().then(function () {
                ModelUpdateService.register(abstractModel);
            });


        };

        this.enableMergeCombinationOperation = function () {
            combinationOperation = 'merge';
        };

        this.enableExtendCombinationOperation = function () {
            combinationOperation = 'extend';
        };

        this.getEntityName = function () {
            return entityName;
        };

        this.getValidations = function () {
            return validations;
        };

        this.getMapping = function () {
            return mapping;
        };

        this.ready = function () {
            return defer.promise;
        };

        this.save = function () {
            var promise = $q(function (resolve) {
                if (abstractModel.dirty()) {
                    angular.extend(mapping.update, {
                        data: abstractModel
                    });
                    WsApi.fetch(mapping.update).then(function (res) {
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
            promise.then(function (res) {
                var message = angular.fromJson(res.body);
                if (message.meta.type === "INVALID") {
                    angular.extend(abstractModel, message.payload[abstractModel.constructor.name]);
                } else {
                    angular.extend(abstractModel, message.payload[abstractModel.constructor.name]);
                    shadow = angular.copy(abstractModel);
                }

            });
            return promise;
        };

        this.delete = function () {
            angular.extend(mapping.remove, {
                data: abstractModel
            });
            var promise = WsApi.fetch(mapping.remove);
            promise.then(function (res) {
                if (angular.fromJson(res.body).meta.type === "INVALID") {
                    angular.extend(abstractModel, angular.fromJson(res.body).payload);
                }
            });
            return promise;
        };

        this.listen = function (cb) {
            listenCallbacks.push(cb);
        };

        this.clearListens = function () {
            listenCallbacks.length = 0;
        };

        this.refresh = function () {
            angular.extend(abstractModel, shadow);
        };

        this.dirty = function () {
            return angular.toJson(abstractModel) !== angular.toJson(shadow);
        };

        this.setValidationResults = function (results) {
            angular.extend(validationResults, results);
        };

        this.getValidationResults = function () {
            return validationResults;
        };

        this.clearValidationResults = function () {
            if (validationResults.messages !== undefined) {
                delete validationResults.messages;
            }
        };

        this.update = function (data) {
            angular[combinationOperation](abstractModel, data);
            shadow = angular.copy(abstractModel);
        };

        $rootScope.$on("$locationChangeSuccess", function () {
            listenCallbacks.length = 0;
        });

        var setData = function (data) {
            angular[combinationOperation](abstractModel, data);
            shadow = angular.copy(abstractModel);
            if (!listening && mapping.modelListeners) {
                listen();
            }
            if (mapping.caching) {
                var cachedModel = ModelCache.get(entityName);
                if (cachedModel === undefined) {
                    ModelCache.set(entityName, abstractModel);
                } else {
                    // could possibly update cache here
                }
            }
            defer.resolve(abstractModel);
        };

        var listen = function () {
            if (abstractModel && mapping.listen) {
                if (abstractModel.id) {
                    angular.extend(mapping.listen, {
                        method: abstractModel.id
                    });
                }
                var notifyPromise = WsApi.listen(mapping.listen);
                notifyPromise.then(null, null, function (res) {
                    processResponse(res);
                    angular.forEach(listenCallbacks, function (cb) {
                        cb(res);
                    });
                });
                listening = true;
                return notifyPromise;
            }
        };

        var processResponse = function (res) {
            var resObj = angular.fromJson(res.body);
            if (resObj.meta.type !== 'ERROR') {
                angular.forEach(resObj.payload, function (datum) {
                    angular[combinationOperation](abstractModel, datum);
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
