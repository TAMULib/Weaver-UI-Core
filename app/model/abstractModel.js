core.factory("AbstractModel", function ($injector, $q, $rootScope, ModelCache, ModelUpdateService, ValidationStore, WsApi) {

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

        var repo;

        $rootScope.$on("$locationChangeSuccess", function () {
            listenCallbacks.length = 0;
        });

        this.updatePending = false;

        this.deletePending = false;

        this.updateRequested = false;

        this.deleteRequested = false;

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

        this.getCombinationOperation = function() {
          return combinationOperation;
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
            injectRepo();
            return repo.save(this);
        };

        this.delete = function () {
            injectRepo();
            return repo.delete(this);
        };

        this.listen = function (cb) {
            listenCallbacks.push(cb);
        };

        this.clearListens = function () {
            listenCallbacks.length = 0;
        };

        this._syncShadow = function () {
            shadow = angular.copy(abstractModel);
        };

        this.acceptPendingUpdate = function() {
            console.warn("No update pending!");
        };

        this.acceptPendingDelete = function() {
            console.warn("No delete pending!");
        };

        this.refresh = function () {
            angular.extend(abstractModel, shadow);
        };

        this.dirty = function () {
            // return angular.toJson(abstractModel) !== angular.toJson(shadow);
            return compare(abstractModel, shadow);
        };

        this.setValidationResults = function (results) {
            injectRepo();
            angular.extend(validationResults, results);
            angular.extend(repo.ValidationResults, results);
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

        var compare = function(m, s) {
            if (typeof m === 'object') {
                if (typeof s === 'object') {
                    var diff = false;
                    for (var i in m) {
                        if (m.hasOwnProperty(i) && i !== '$$hashKey' && i !== '$$state') {
                            diff = compare(m[i], s[i]);
                            if (diff) {
                                break;
                            }
                        }
                    }
                    return diff;
                } else {
                    return false;
                }
            } else if (typeof m === 'function') {
                return false;
            } else {
                // console.log(m !== s, m, s);
                return m !== s;
            }
        };

        var injectRepo = function () {
            if (repo === undefined) {
                repo = $injector.get(repoName);
            }
        };

        var setData = function (data) {

            angular[combinationOperation](abstractModel, data);

            abstractModel._syncShadow();
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
            if (resObj.meta.status !== 'ERROR') {
                if(combinationOperation === 'extend') {
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
