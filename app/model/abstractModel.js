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
				var response = JSON.parse(data.body);
				var payload = response.payload;
				var meta = response.meta;
				var key = Object.keys(payload)[0];
				if(data.body) {
					angular.extend(self, payload[key]);
					if(meta.type == "ERROR") {
						angular.extend(self, {'error':true});
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
					var key = Object.keys(payload)[0];
					angular.extend(self, payload[key]);
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
			var key = Object.keys(payload)[0];
			if(typeof payload[key] != 'undefined') {
				self.unwrap(self, payload[key]);
			}
			else {
				console.log(key + ' is undefined');
				console.log(data);
			}
		});
	};
	
	return AbstractModel;

});