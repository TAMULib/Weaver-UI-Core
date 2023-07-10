core.factory("AbstractModel", function ($injector, $rootScope, $q, $timeout, ModelCache, ModelUpdateService, ValidationStore, WsApi) {

    return function AbstractModel(repoName) {

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
        
        var beforePromises = [];
        
        var repo;

        var dirty = false;

        var fetchingPromise;

        $rootScope.$on("$routeChangeSuccess", function () {
            listenCallbacks.length = 0;
        });

        this.updatePending = false;

        this.deletePending = false;

        this.updateRequested = false;

        this.deleteRequested = false;

        this.before = function (beforeMethod) {
            beforeMethodBuffer.push(beforeMethod);
        };

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
                    if (fetchingPromise === undefined) {
                        fetchingPromise = WsApi.fetch(mapping.instantiate);
                    }
                    fetchingPromise.then(function (res) {
                        processResponse(res);

                        var timeout = !!mapping.timeout && typeof mapping.timeout === 'number'
                            ? mapping.timeout
                            : -1;

                        if (timeout > -1) {
                            console.log(timeout, mapping, typeof mapping.timeout);
                            $timeout(function () {
                                fetchingPromise = undefined;
                            }, timeout);
                        }
                    }, function (error) {
                        fetchingPromise = undefined;
                        defer.reject(error);
                    });
                }

            }
        };

        this.init = function (data, apiMapping) {

            abstractModel = this;

            mapping = apiMapping;

            entityName = abstractModel.constructor.getName();

            if (mapping.validations && entityName !== undefined && entityName !== null && entityName.length > 0) {
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
                var beforePromise = beforeMethod();
                if(beforePromise && beforePromise.$$state) {
                    beforePromises.push(beforePromise);
                }
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

        this.getCombinationOperation = function () {
            return combinationOperation;
        };

        this.getEntityName = function () {
            return entityName;
        };

        this.getValidations = function () {
            return validations;
        };

        this.setValidations = function (customValidations) {
            validations = customValidations;
        };

        this.getMapping = function () {
            return mapping;
        };

        this.ready = function () {
            var aggDefer = $q.defer();
            beforePromises.push(defer.promise);
            $q.all(beforePromises).then(function(result) {
              aggDefer.resolve(result[0]);
            });
            return aggDefer.promise;
        };

        this.save = function () {
            if (injectRepo()) {
                return repo.save(this);
            } else {
                var model = this;
                var promise = $q(function (resolve) {
                    // when clicking a checkbox model is never dirty
                    if (model.dirty(true)) {
                        angular.extend(mapping.update, {
                            data: model
                        });
                        WsApi.fetch(mapping.update).then(function (res) {
                            resolve(res);
                        });
                    } else {
                        var payload = {};
                        payload[model.constructor.name] = model;
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
                    if (message.meta.status === "INVALID") {
                        angular.extend(abstractRepo, message.payload);
                    }
                });
                return promise;
            }
        };

        this.delete = function () {
            if (injectRepo()) {
                return repo.delete(this);
            } else {
                var model = this;
                angular.extend(mapping.remove, {
                    data: model
                });
                var promise = WsApi.fetch(mapping.remove);
                promise.then(function (res) {
                    var message = angular.fromJson(res.body);
                    if (message.meta.status === "INVALID") {
                        angular.extend(abstractRepo, message.payload);
                    }
                });
                return promise;
            }
        };

        this.listen = function (cb) {
            listenCallbacks.push(cb);
        };

        this.clearListens = function () {
            listenCallbacks.length = 0;
        };

        this._syncShadow = function () {
            dirty = false;
            shadow = angular.copy(abstractModel);
        };

        this.getShadow = function () {
            return shadow;
        };

        this.acceptPendingUpdate = function () {
            console.warn("No update pending!");
        };

        this.acceptPendingDelete = function () {
            console.warn("No delete pending!");
        };

        this.refresh = function () {
            angular.extend(abstractModel, shadow);
        };

        this.dirty = function (value) {
            if (value) {
                dirty = value;
            }
            return dirty;
        };

        this.setValidationResults = function (results) {
            angular.extend(validationResults, results);
            if (injectRepo()) {
                angular.extend(repo.ValidationResults, results);
            }
        };

        this.getValidationResults = function () {
            return validationResults;
        };

        this.clearValidationResults = function () {
            delete validationResults.messages;
        };

        this.update = function (data) {
            angular[combinationOperation](abstractModel, data);
            abstractModel._syncShadow();
        };

        this.extend = function (changes) {
            angular.extend(abstractModel, changes);
            abstractModel._syncShadow();
        };

        var injectRepo = function () {
            if (repo === undefined) {
                try {
                    repo = $injector.get(repoName);
                } catch (e) {
                    console.warn('Unable to inject ' + repoName);
                    return false;
                }
                return true;
            } else {
                return true;
            }
        };

        var setData = function (data) {

            angular[combinationOperation](abstractModel, data);

            abstractModel._syncShadow();
            if (!listening && mapping.modelListeners) {
                listen();
            }
            if (mapping.caching) {
                ModelCache.set(entityName, abstractModel);
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
            if (resObj.meta.status !== 'ERROR') {
                if (combinationOperation === 'extend') {
                    angular.forEach(resObj.payload, function (datum) {
                        angular[combinationOperation](abstractModel, datum);
                    });
                }
                setData(abstractModel);
            } else {
                abstractModel.refresh();
            }
        };

        // additional core level model methods and variables

        return this;
    };

});
