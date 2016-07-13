core.factory("AbstractModel", function ($q, $sanitize, WsApi) {

	return function AbstractModelNew() {

		var abstractModel;

		var mapping;

		var defer = $q.defer();

		var listenCallbacks = [];

		var shadow = {};

		var cache;

		var entityName;

		this.init = function(data, apiMapping) {

			abstractModel = this;

			entityName = abstractModel.constructor.name;

			mapping = apiMapping;

			if(data) {
				setData(data);
			}
			else if(cache !== undefined) {
				setData(cache);
			}
			else {
				WsApi.fetch(mapping.instantiate).then(function(res) {
					cache = cache !== undefined ? cache : {};
					processResponse(res);
					listen();
				});
			}

		};

		this.getEntityName = function() {
			return entityName;
		};

		this.mapping = function() {
			return mapping;
		};

		this.ready = function() {
			return defer.promise;
		};

		this.save = function() {
			var promise = $q(function(resolve) {
				if(abstractModel.dirty()) {
					angular.extend(mapping.update, {data: abstractModel});
					console.log(mapping.update)
					WsApi.fetch(mapping.update).then(function(res) {						
						resolve(res);
					});
				}
				else {
					var payload = {};
					payload[abstractModel.constructor.name] = abstractModel;
					resolve({
						body: angular.toJson({ 
							payload: payload
						})
					});
				}
			});
			promise.then(function(res) {
				if(angular.fromJson(res.body).meta.type == "INVALID") {
					angular.extend(abstractModel, angular.fromJson(res.body).payload);
					console.log(abstractModel);
				}
			});
			return promise;
		};

		this.delete = function() {
			angular.extend(mapping.remove, {data: abstractModel});
			var promise = WsApi.fetch(mapping.remove);
			promise.then(function(res) {				
				if(angular.fromJson(res.body).meta.type == "INVALID") {
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

		var setData = function(data) {
			angular.extend(abstractModel, data);
			shadow = angular.copy(abstractModel);
			defer.resolve();
		};

		var listen = function() {
			angular.extend(mapping.listen, {method: abstractModel.id});
			var notifyPromise = WsApi.listen(mapping.listen);
			notifyPromise.then(null, null, function(res) {
				processResponse(res);
				angular.forEach(listenCallbacks, function(cb) {
					cb(res);
				});
			});
			return notifyPromise;
		};

		var processResponse = function(res) {

			var resObj = angular.fromJson(res.body);

			var meta = resObj.meta;

			if(meta.type != 'ERROR') {
				var payload = resObj.payload;

				angular.forEach(payload, function(datum) {
					angular.extend(cache, datum);
				});

				angular.extend(abstractModel, cache);
				setData(cache);
			}
			else {
				abstractModel.refresh();
			}
			
		};
		
		// additional core level model methods and variables
		
		return this;

	};
	
});