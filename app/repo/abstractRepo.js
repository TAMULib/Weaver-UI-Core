core.service("AbstractRepo", function ($rootScope, $q, WsApi, ValidationStore) {

	return function AbstractRepo(model, mapping) {

		var abstractRepo = this;

		abstractRepo.mapping = mapping;

		var list = [];

		var initialized = false;

		var defer = $q.defer();

		var listenCallbacks = [];

		var entityName = new model({}).getEntityName();

		var validations = ValidationStore.getValidations(entityName);

		$rootScope.$on("$locationChangeSuccess", function() {
	        listenCallbacks.length = 0;   
	    });

		var build = function(data) {

			initialized = false;
			return $q(function(resolve) {
				list.length = 0;
				angular.forEach(data, function(modelJson) {
					list.push(new model(modelJson));
				});
				initialized = true;
				resolve();
			});
		};

		var unwrap = function(res) {
			var repoObj = {};
			var payload = angular.fromJson(res.body).payload;
			var keys = Object.keys(payload);
			angular.forEach(keys, function(key) {
				angular.extend(repoObj, payload[key]);
			});
			return repoObj;
		};

		var fetch = function() {
			if(abstractRepo.mapping.all !== undefined) {
				WsApi.fetch(abstractRepo.mapping.all).then(function(res) {
					build(unwrap(res)).then(function() {
						defer.resolve(res);
					});
				});
			}
		};

		WsApi.listen(abstractRepo.mapping.listen).then(null, null, function(res) {
			build(unwrap(res)).then(function() {
				angular.forEach(listenCallbacks, function(cb) {
					cb(res);
				});
			});
		});

		if(!mapping.lazy) {
			fetch();
		}

		abstractRepo.ValidationResults = {};

		abstractRepo.add = function(modelJson) {			
			initialized = true;
			build([modelJson]);
		};

		abstractRepo.addAll = function(modelJsons) {		
			initialized = true;
			build(modelJsons);
		};

		abstractRepo.getEntityName = function() {
			return entityName;
		};

		abstractRepo.getValidations = function() {
			return validations;
		};

		abstractRepo.count = function() {
			if(!initialized) {
				console.warn('Repo ('+entityName+') not initialized!');
			}
			return list.length;
		};

		abstractRepo.getAll = function() {
			if(mapping.lazy) {
				fetch();
			}
			return abstractRepo.getContents();
		};

		abstractRepo.getContents = function() {
			return list;
		};

		abstractRepo.saveAll = function() {
			angular.forEach(list, function(model) {
				model.save();
			});
		};

		abstractRepo.ready = function() {
			return defer.promise;
		};

		abstractRepo.reset = function() {
			defer = $q.defer();
			fetch();
		};

		abstractRepo.findById = function(id) {
			var match;
			
			var find = function(id) {
				for(var key in list) {
					if(list[key].id == id) {
						return list[key];
					}
				}
			};

			if(initialized) {
				match = find(id);
			}
			else {
				// TODO: think of a way to find after ready and have binding in list
				console.warn('Repo ('+entityName+') not initialized!');
			}

			return match;
		};

		abstractRepo.delete = function(model) {
			abstractRepo.clearValidationResults();
			var promise = model.delete();
			promise.then(function(res) {
				if(angular.fromJson(res.body).meta.type == "INVALID") {
					angular.extend(abstractRepo, angular.fromJson(res.body).payload);
				}
			});
			return promise;
		};

		abstractRepo.deleteById = function(id) {
			abstractRepo.clearValidationResults();
			var promise = abstractRepo.findById(id).delete();
			promise.then(function(res) {
				if(angular.fromJson(res.body).meta.type == "INVALID") {
					angular.extend(abstractRepo, angular.fromJson(res.body).payload);
				}
			});
			return promise;
		};

		abstractRepo.create = function(model) {
			abstractRepo.clearValidationResults();
			angular.extend(abstractRepo.mapping.create, {'data': model});
			var promise = WsApi.fetch(abstractRepo.mapping.create);
			promise.then(function(res) {
				if(angular.fromJson(res.body).meta.type == "INVALID") {
					angular.extend(abstractRepo, angular.fromJson(res.body).payload);
				}
			});
			return promise;
		};

		// TODO: remove
		abstractRepo.update = function(model) {
			abstractRepo.clearValidationResults();
           	var promise = model.save();
           	promise.then(function(res) {
				if(angular.fromJson(res.body).meta.type == "INVALID") {
					angular.extend(abstractRepo, angular.fromJson(res.body).payload);
				}
			});
			return promise;
		};

		abstractRepo.listen = function(cb) {
			listenCallbacks.push(cb);
		};

		// additiona core level repo methods and variables

		// these should be added through decoration
		abstractRepo.sort = function(facet) {
			abstractRepo.clearValidationResults();
			angular.extend(abstractRepo.mapping.sort, {'method': 'sort/' + facet});
			var promise = WsApi.fetch(abstractRepo.mapping.sort);
			promise.then(function(res) {
				if(angular.fromJson(res.body).meta.type == "INVALID") {
					angular.extend(abstractRepo, angular.fromJson(res.body).payload);
					console.log(abstractRepo);
				}
			});
			return promise;
		};

		abstractRepo.reorder = function(src, dest) {
			abstractRepo.clearValidationResults();
			angular.extend(abstractRepo.mapping.reorder, {'method': 'reorder/' + src + '/' + dest});
			var promise = WsApi.fetch(abstractRepo.mapping.reorder);
			promise.then(function(res) {
				if(angular.fromJson(res.body).meta.type == "INVALID") {
					angular.extend(abstractRepo, angular.fromJson(res.body).payload);
					console.log(abstractRepo);
				}
			});
			return promise;
		};

		abstractRepo.getValidationResults = function() {
			return abstractRepo.ValidationResults;
		};

		abstractRepo.clearValidationResults = function() {
			if(abstractRepo.ValidationResults.messages !== undefined) {
				delete abstractRepo.ValidationResults.messages;
			}
		};

		return abstractRepo;
	}

});
