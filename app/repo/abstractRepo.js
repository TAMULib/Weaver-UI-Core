core.service("AbstractRepo", function ($q, $rootScope, ApiResponseActions, ValidationStore, WsApi) {

    return function AbstractRepo(modelName, model, mapping) {

        var abstractRepo = this;

        abstractRepo.mapping = mapping;

        var list = [];

        var defer = $q.defer();

        var listenCallbacks = [];

        var validations = {};

        if (abstractRepo.mapping.validations && modelName !== undefined && modelName !== null && modelName.length > 0) {
            validations = ValidationStore.getValidations(modelName);
        }

        $rootScope.$on("$locationChangeSuccess", function () {
            listenCallbacks.length = 0;
        });

        var build = function (data) {
            return $q(function (resolve) {
                list.length = 0;
                angular.forEach(data, function (modelJson) {
                    abstractRepo.add(modelJson);
                });
                resolve();
            });
        };

        var unwrap = function (res) {
            var repoObj = {};
            var payload = angular.fromJson(res.body).payload;
            var keys = Object.keys(payload);
            angular.forEach(keys, function (key) {
                angular.extend(repoObj, payload[key]);
            });
            return repoObj;
        };

        var fetch = function () {
            if (abstractRepo.mapping.all !== undefined) {
                WsApi.fetch(abstractRepo.mapping.all).then(function (res) {
                    build(unwrap(res)).then(function () {
                        defer.resolve(res);
                    });
                });
            }
        };

        if (abstractRepo.mapping.listen) {
            WsApi.listen(abstractRepo.mapping.listen).then(null, null, function (res) {
                build(unwrap(res)).then(function () {
                    angular.forEach(listenCallbacks, function (cb) {
                        cb(res);
                    });
                });
            });
        }

        if (abstractRepo.mapping.channel) {

            WsApi.listen(abstractRepo.mapping.channel).then(null, null, function (res) {

                var resObj = angular.fromJson(res.body);
                var modelObj = unwrap(res);

                switch (resObj.meta.action) {
                case ApiResponseActions.CREATE:
                    abstractRepo.add(modelObj);
                    break;
                case ApiResponseActions.UPDATE:
                    var foundModel = abstractRepo.findById(modelObj.id);
                    angular.extend(foundModel, modelObj);
                    foundModel._syncShadow();
                    break;
                case ApiResponseActions.DELETE:
                    for (var i in list) {
                        var existingModel = list[i];
                        if (existingModel.id === modelObj.id) {
                            list.splice(i, 1);
                            break;
                        }
                    }
                    break;
                case ApiResponseActions.REMOVE:
                case ApiResponseActions.REORDER:
                case ApiResponseActions.SORT:
                    list.length = 0;
                    angular.forEach(unwrap(res), function (modelObj) {
                        list.push(new model(modelObj));
                    });
                    break;
                }
            });
        }

        if (!mapping.lazy) {
            fetch();
        }

        abstractRepo.ValidationResults = {};

        abstractRepo.unshift = function (modelJson) {
            list.unshift(new model(modelJson));
        };

        abstractRepo.add = function (modelJson) {
            list.push(new model(modelJson));
        };

        abstractRepo.addAll = function (modelJsons) {
            for (var i in modelJsons) {
                abstractRepo.add(modelJsons[i]);
            }
        };

        abstractRepo.remove = function (modelToRemove) {
            for (var i in list) {
                if (list[i].id === modelToRemove.id) {
                    list.splice(i, 1);
                    break;
                }
            }
        };

        abstractRepo.empty = function () {
            list.length = 0;
        };

        abstractRepo.getEntityName = function () {
            return modelName;
        };

        abstractRepo.getValidations = function () {
            return validations;
        };

        abstractRepo.count = function () {
            return list.length;
        };

        abstractRepo.getAll = function () {
            if (mapping.lazy) {
                fetch();
            }
            return abstractRepo.getContents();
        };

        abstractRepo.getContents = function () {
            return list;
        };

        abstractRepo.save = function (model) {
            abstractRepo.clearValidationResults();
            var promise = $q(function (resolve) {
                if (model.dirty()) {
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
                } else {
                    model._syncShadow();
                }
            });
            return promise;
        };

        abstractRepo.saveAll = function () {
            abstractRepo.clearValidationResults();
            angular.forEach(list, function (model) {
                abstractRepo.save(model);
            });
        };

        abstractRepo.ready = function () {
            return defer.promise;
        };

        abstractRepo.reset = function () {
            defer = $q.defer();
            fetch();
        };

        abstractRepo.findById = function (id) {
            for (var i in list) {
                if (list[i].id == id) {
                    return list[i];
                }
            }
        };

        abstractRepo.delete = function (model) {
            abstractRepo.clearValidationResults();
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
        };

        abstractRepo.deleteById = function (id) {
            abstractRepo.clearValidationResults();
            var promise = abstractRepo.findById(id).delete();
            promise.then(function (res) {
                var message = angular.fromJson(res.body);
                if (message.meta.status === "INVALID") {
                    angular.extend(abstractRepo, message.payload);
                }
            });
            return promise;
        };

        abstractRepo.create = function (model) {
            abstractRepo.clearValidationResults();
            angular.extend(abstractRepo.mapping.create, {
                'data': model
            });
            var promise = WsApi.fetch(abstractRepo.mapping.create);
            promise.then(function (res) {
                var message = angular.fromJson(res.body);
                if (message.meta.status === "INVALID") {
                    angular.extend(abstractRepo, message.payload);
                }
            });
            return promise;
        };

        abstractRepo.update = function (model) {
            abstractRepo.clearValidationResults();
            var promise = abstractRepo.save(model);
            promise.then(function (res) {
                var message = angular.fromJson(res.body);
                if (message.meta.type === "INVALID") {
                    angular.extend(abstractRepo, message.payload);
                }
            });
            return promise;
        };

        abstractRepo.listen = function (cb) {
            listenCallbacks.push(cb);
        };

        // additiona core level repo methods and variables

        // these should be added through decoration
        abstractRepo.sort = function (facet) {
            abstractRepo.clearValidationResults();
            angular.extend(abstractRepo.mapping.sort, {
                'method': 'sort/' + facet
            });
            var promise = WsApi.fetch(abstractRepo.mapping.sort);
            promise.then(function (res) {
                var message = angular.fromJson(res.body);
                if (message.meta.status === "INVALID") {
                    angular.extend(abstractRepo, message.payload);
                }
            });
            return promise;
        };

        abstractRepo.reorder = function (src, dest) {
            abstractRepo.clearValidationResults();
            angular.extend(abstractRepo.mapping.reorder, {
                'method': 'reorder/' + src + '/' + dest
            });
            var promise = WsApi.fetch(abstractRepo.mapping.reorder);
            promise.then(function (res) {
                var message = angular.fromJson(res.body);
                if (message.meta.status === "INVALID") {
                    angular.extend(abstractRepo, message.payload);
                }
            });
            return promise;
        };

        abstractRepo.getValidationResults = function () {
            return abstractRepo.ValidationResults;
        };

        abstractRepo.clearValidationResults = function () {
            delete abstractRepo.ValidationResults.messages;
        };

        return abstractRepo;
    }

});
