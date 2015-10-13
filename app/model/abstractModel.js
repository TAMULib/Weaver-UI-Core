core.service("AbstractModel", function () {

	var AbstractModel = function(data) {
		angular.extend(this, data);
	};

	
	/*
	* All abstracted methods can go here: (e.g. AbstractModel.myMethod = funciton() {} )
	* A model can then extend this my including "self = this;" and "angular.extend(self, AbstractModel);"
	* in its contructor.
	*/
	AbstractModel.unwrap = function(self, futureData) {
		if(!futureData.$$state) {
			angular.extend(self, futureData);
			return;
		}
		futureData.then(
			function(data) {
				if(data.body) {
					var response = JSON.parse(data.body);
					var payload = response.payload;
					var meta = response.meta;
					var keys = Object.keys(payload);
					if(meta.type == "ERROR") {
						angular.extend(self, {'error':true});
					}
					else {
						for(var i in keys) {
							angular.extend(self, payload[keys[i]]);
						}
					}
				} else {
					angular.extend(self, data);
				}
			},
			function(data) {
				console.error(data);
			},
			function(data) {
				if(data.body) {
					var response = JSON.parse(data.body);
					var payload = response.payload;
					var meta = response.meta;
					var keys = Object.keys(payload);
					if(meta.type == "ERROR") {
						angular.extend(self, {'error':true});
					}
					else {
						for(var i in keys) {
							angular.extend(self, payload[keys[i]]);
						}
					}
				}
				else {
					angular.extend(self, {'value':data});
				}
		});
	};

	AbstractModel.update = function(self, promise) {
		promise.then(function(data) {
			var response = JSON.parse(data.body);
			var payload = response.payload;
			var meta = response.meta;
			var keys = Object.keys(payload);
			for(var i in keys) {
				if(typeof payload[key[i]] != 'undefined') {
					self.unwrap(self, payload[key[i]]);
				}
				else {
					console.log(key[i] + ' is undefined');
					console.log(data);
				}
			}			
		});
	};
	
	return AbstractModel;

});