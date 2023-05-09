core.service("AbstractRepo", function ($q, $rootScope, $timeout, ApiResponseActions, ValidationStore, WsApi) {

    return function AbstractRepo(modelName, model, mapping) {

        var abstractRepo = this;

        var list = [];

        var defer = $q.defer();

        var actionCbs = {};

        var actionOverrides = {};

        angular.forEach(ApiResponseActions, function (action) {
            actionCbs[action] = [];
        });

        var validations = {};

        var pendingChanges;

        var fetchingAllPromise;

        var forceLoad = true;

        $rootScope.$on("$routeChangeSuccess", function () {
            angular.forEach(actionCbs, function (actionCbs) {
                actionCbs.length = 0;
            });
        });

        abstractRepo.mapping = mapping;

        abstractRepo.ValidationResults = {};

        abstractRepo.unshift = function (modelJson) {
            list.unshift(new model(modelJson));
        };

        abstractRepo.contains = function (model) {
            var contains = false;
            if (angular.isObject(model) && angular.isDefined(model.id)) {
                for (var i in list) {
                    if (angular.toJson(list[i]) === angular.toJson(model.id)) {
                        contains = true;
                        break;
                    }
                }
            }
            return contains;
        };

        abstractRepo.add = function (modelJson) {
            if (!abstractRepo.contains(modelJson)) {
                list.push(new model(modelJson));
            }
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
            if (forceLoad) {
                fetch();
                forceLoad = false;
            }
            return abstractRepo.getContents();
        };

        abstractRepo.findAll = function () {
            return $q(function (resolve) {
                if (forceLoad) {
                    fetch();
                    forceLoad = false;

                    defer.promise.then(function() {
                        resolve(abstractRepo.getContents());
                    });
                } else {
                    resolve(abstractRepo.getContents());
                }
            });
        };

        abstractRepo.getContents = function () {
            return list;
        };

        abstractRepo.setToUpdate = function (id) {
            var modelToUpdate = abstractRepo.findById(id);
            setToUpdate(modelToUpdate);
        };

        abstractRepo.save = function (model) {
            abstractRepo.clearValidationResults();
            var promise = $q(function (resolve) {
                if (model.dirty()) {
                    setToUpdate(model);
                    angular.extend(mapping.update, {
                        data: model
                    });
                    WsApi.fetch(mapping.update).then(function (res) {
                        resolve(res);
                    });
                } else {
                    console.log('Not processing request. No changes to model.', model);
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
            forceLoad = false;
            defer = $q.defer();
            fetch();
            return defer.promise;
        };

        abstractRepo.findById = function (id) {
            for (var i in list) {
                if (list[i].id == id) {
                    return list[i];
                }
            }
        };

        abstractRepo.setToDelete = function (id) {
            var modelToDelete = abstractRepo.findById(id);
            setToDelete(modelToDelete);
        };

        abstractRepo.delete = function (model) {
            abstractRepo.clearValidationResults();
            setToDelete(model);
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
                if (message.meta.status === "INVALID") {
                    angular.extend(abstractRepo, message.payload);
                }
            });
            return promise;
        };

        abstractRepo.listen = function (cbOrActionOrActionArray, cb) {
            if (typeof cbOrActionOrActionArray === "function") {
                actionCbs[ApiResponseActions.ANY].push(cbOrActionOrActionArray);
            } else if (Array.isArray(cbOrActionOrActionArray)) {
                angular.forEach(cbOrActionOrActionArray, function (action) {
                    actionCbs[action].push(cb);
                });
            } else {
                actionCbs[cbOrActionOrActionArray].push(cb);
            }
        };

        abstractRepo.acceptPendingChanges = function () {
            var newList = [];

            // create new list from pendingChanges object as actual models
            angular.forEach(pendingChanges, function (modelObj) {
                newList.push(new model(modelObj));
            });

            var i, j, newItem, match;

            // find and extend updated entities and splice out removed entities
            for (i = 0; i < newList.length; i++) {
                newItem = newList[i];

                match = false;

                for (j = 0; j < list.length; j++) {
                    item = list[j];

                    if (item.id === newItem.id) {
                        angular.extend(item, newItem);
                        match = true;
                        break;
                    }
                }

                // if no match, entity has been deleted
                if (!match) {
                    list.splice(i, 0, newItem);
                }

            }

            // check for newly created entities and insert them
            for (i = list.length - 1; i >= 0; i--) {
                item = list[i];

                match = false;

                for (j = newList.length - 1; j >= 0; j--) {
                    newItem = newList[j];

                    if (newItem.id === item.id) {
                        match = true;
                        break;
                    }
                }

                // if no match insert newly created entity
                if (!match) {
                    list.splice(i, 1);
                }
            }

            pendingChanges = undefined;
        };

        abstractRepo.changesPending = function () {
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

        abstractRepo.makeReady = function () {
            defer.resolve(list);
            return defer.promise;
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
                if (fetchingAllPromise === undefined) {
                    fetchingAllPromise = WsApi.fetch(abstractRepo.mapping.all);
                }
                fetchingAllPromise.then(function (res) {
                    build(unwrap(res)).then(function () {
                        defer.resolve(res);

                        var timeout = !!abstractRepo.mapping.timeout && typeof abstractRepo.mapping.timeout === 'Number'
                            ? abstractRepo.mapping.timeout
                            : 0;

                        console.log(timeout, abstractRepo.mapping, typeof abstractRepo.mapping.timeout);

                        if (timeout) {
                            $timeout(function () {
                                fetchingAllPromise = undefined;
                            }, timeout);
                        }
                    });
                }, function (error) {
                    fetchingAllPromise = undefined;
                    defer.reject(error);
                });
            }
        };

        var setToUpdate = function (model) {
            model.updateRequested = true;
            model._syncShadow();
        };

        var setToDelete = function (model) {
            model.deleteRequested = true;
            model._syncShadow();
        };

        var acceptPendingModelUpdate = function (model, pending) {
            var combinationOperation = model.getCombinationOperation();
            if (combinationOperation === 'extend') {
                angular.forEach(pending, function (datum) {
                    angular[combinationOperation](model, pending);
                });
            }
            angular[combinationOperation](model, pending);
            model.updatePending = false;
            model.updateRequested = false;
            model.acceptPendingUpdate = function () {
                console.warn("No update pending!");
            };
            model._syncShadow();
        };

        var acceptPendingModelDelete = function (model, i) {
            list.splice(i, 1);
            model.deletePending = false;
            model.deleteRequested = false;
            model.acceptPendingDelete = function () {
                console.warn("No delete pending!");
            };
        };

        var runActionCBs = function (action, resObj) {
            angular.forEach(actionCbs[action], function (cb) {
                cb(resObj);
            });
        };

        if (abstractRepo.mapping.validations && modelName !== undefined && modelName !== null && modelName.length > 0) {
            validations = ValidationStore.getValidations(modelName);
        }

        // TODO: remove when all repos upgraded!!!
        if (abstractRepo.mapping.listen) {
            WsApi.listen(abstractRepo.mapping.listen).then(null, null, function (res) {
                build(unwrap(res)).then(function () {
                    runActionCBs(ApiResponseActions.ANY, angular.fromJson(res.body));
                });
            });
        }

        abstractRepo.overrideAction = function (action, cb) {
            actionOverrides[action] = cb;
        };

        if (abstractRepo.mapping.channel) {

            WsApi.listen(abstractRepo.mapping.channel).then(null, null, function (res) {

                var resObj = angular.fromJson(res.body);
                var modelObj = unwrap(res);

                if (actionOverrides[resObj.meta.action]) {
                    actionOverrides[resObj.meta.action](modelObj);
                } else {
                    switch (resObj.meta.action) {
                        case ApiResponseActions.CREATE:
                            abstractRepo.add(modelObj);
                            break;
                        case ApiResponseActions.READ:
                        case ApiResponseActions.UPDATE:
                            var existingModelToUpdate = abstractRepo.findById(modelObj.id);
                            if (existingModelToUpdate) {
                                if (existingModelToUpdate.updateRequested || !existingModelToUpdate.dirty()) {
                                    acceptPendingModelUpdate(existingModelToUpdate, modelObj);
                                } else {
                                    existingModelToUpdate.updatePending = true;
                                    existingModelToUpdate.acceptPendingUpdate = function () {
                                        acceptPendingModelUpdate(existingModelToUpdate, modelObj);
                                    };
                                    console.warn(resObj.meta.action + " attempted on dirty model", existingModelToUpdate);
                                }
                            }
                            break;
                        case ApiResponseActions.DELETE:
                            for (var i in list) {
                                var existingModelToDelete = list[i];
                                if (existingModelToDelete.id === modelObj.id) {
                                    if (existingModelToDelete.deleteRequested || !existingModelToDelete.dirty()) {
                                        acceptPendingModelDelete(existingModelToDelete, i);
                                    } else {
                                        existingModelToDelete.deletePending = true;
                                        /*jshint loopfunc: true */
                                        existingModelToDelete.acceptPendingDelete = function () {
                                            acceptPendingModelDelete(existingModelToDelete, i);
                                        };
                                        console.warn(resObj.meta.action + " attempted on dirty model", existingModelToDelete);
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
                            for (var j in list) {
                                repoDirty = !list[j].updateRequested && list[j].dirty();
                                if (repoDirty) {
                                    console.log(list[j]);
                                    break;
                                }
                            }
                            pendingChanges = modelObj;
                            if (!repoDirty) {
                                abstractRepo.acceptPendingChanges();
                            } else {
                                console.warn(resObj.meta.action + " attempted on dirty repo");
                            }
                            break;
                    }
                }

                runActionCBs(resObj.meta.action, resObj);
                runActionCBs(ApiResponseActions.ANY, resObj);
            });
        }

        if (!mapping.lazy) {
            fetch();
            forceLoad = false;
        }

        return abstractRepo;
    };

});
