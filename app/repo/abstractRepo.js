core.service("AbstractRepo", function ($q, $rootScope, $timeout, ApiResponseActions, ValidationStore, WsApi) {

    return function AbstractRepo(modelName, model, mapping) {

        var abstractRepo = this;

        var list = [];

        var defer = $q.defer();

        var actionCbs = {};

        angular.forEach(ApiResponseActions, function(action) {
          actionCbs[action] = [];
        });

        var validations = {};

        var pendingChanges;

        $rootScope.$on("$locationChangeSuccess", function () {
          angular.forEach(actionCbs, function(actionCbs) {
            actionCbs.length = 0;
          });
        });

        abstractRepo.mapping = mapping;

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
                    model.updateRequested = true;
                    model._syncShadow();
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
                    model.acceptPendingUpdate();
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
            model.deleteRequested = true;
            model._syncShadow();
            angular.extend(mapping.remove, {
                data: model
            });
            var promise = WsApi.fetch(mapping.remove);
            promise.then(function (res) {
                var message = angular.fromJson(res.body);
                if (message.meta.status === "INVALID") {
                    angular.extend(abstractRepo, message.payload);
                } else {
                    model.acceptPendingDelete();
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

        abstractRepo.listen = function (cbOrAction, cb) {
            if(typeof cbOrAction === "function") {
              actionCbs[ApiResponseActions.ANY].push(cbOrAction);
            } else {
              actionCbs[cbOrAction].push(cb);
            }
        };

        abstractRepo.acceptPendingChanges = function() {
            list.length = 0;
            angular.forEach(pendingChanges, function (modelObj) {
                list.push(new model(modelObj));
            });
            delete pendingChanges;
        };

        abstractRepo.changesPending = function() {
            return pendingChanges !== undefined;
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

        var acceptPendingModelUpdate = function(model, pending) {
            angular.extend(model, pending);
            model.updatePending = false;
            model.updateRequested = false;
            model.acceptPendingUpdate = function() {
                console.warn("No update pending!");
            };
            model._syncShadow();
        };

        var acceptPendingModelDelete = function(model, i) {
            list.splice(i, 1);
            model.deletePending = false;
            model.deleteRequested = false;
            model.acceptPendingDelete = function() {
                console.warn("No delete pending!");
            };
        };

        var runActionCBs = function(action, resObj) {
          angular.forEach(actionCbs[action], function(cb) {
            cb(resObj);
          });
        };

        if (abstractRepo.mapping.validations && modelName !== undefined && modelName !== null && modelName.length > 0) {
            validations = ValidationStore.getValidations(modelName);
        }

        if (abstractRepo.mapping.listen) {
            WsApi.listen(abstractRepo.mapping.listen).then(null, null, function (res) {
                build(unwrap(res)).then(function () {
                    runActionCBs(ApiResponseActions.ANY, angular.fromJson(res.body));
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
                case ApiResponseActions.READ:
                case ApiResponseActions.UPDATE:
                    var existingModelToUpdate = abstractRepo.findById(modelObj.id);
                    if(existingModelToUpdate.updateRequested || !existingModelToUpdate.dirty()) {
                        acceptPendingModelUpdate(existingModelToUpdate, modelObj);
                    } else {
                        existingModelToUpdate.updatePending = true;
                        existingModelToUpdate.acceptPendingUpdate = function() {
                            acceptPendingModelUpdate(existingModelToUpdate, modelObj);
                        };
                        console.warn("Update attempted on dirty model", existingModelToUpdate);
                    }
                    break;
                case ApiResponseActions.DELETE:
                    for (var i in list) {
                        var existingModelToDelete = list[i];
                        if (existingModelToDelete.id === modelObj.id) {
                            if(existingModelToDelete.deleteRequested || !existingModelToDelete.dirty()) {
                                acceptPendingModelDelete(i);
                            } else {
                                existingModelToDelete.deletePending = true;
                                /*jshint loopfunc: true */
                                existingModelToDelete.acceptPendingDelete = function() {
                                    acceptPendingModelDelete(i);
                                };
                                console.warn("Delete attempted on dirty model", existingModelToDelete);
                            }
                            break;
                        }
                    }
                    break;
                case ApiResponseActions.REMOVE:
                case ApiResponseActions.REORDER:
                case ApiResponseActions.SORT:
                case ApiResponseActions.BROADCAST:
                    var repoDirty = false;
                    for(var j in list) {
                        repoDirty = list[j].dirty();
                        if(repoDirty) break;
                    }
                    pendingChanges = unwrap(res);
                    if(!repoDirty) {
                        abstractRepo.acceptPendingChanges();
                    } else {
                        console.warn(resObj.meta.action + " attempted on dirty repo");
                    }
                    break;
                }
                runActionCBs(resObj.meta.action, resObj);
                runActionCBs(ApiResponseActions.ANY, resObj);
            });
        }

        if (!mapping.lazy) {
            fetch();
        }

        return abstractRepo;
    };

});
