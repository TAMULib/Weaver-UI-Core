core.service("AbstractModel", function () {

	var AbstractModel = function(data) {
		angular.extend(this, data);
	};

	
	/*
	* All abstracted methods can go here: (e.g. AbstractModel.myMethod = funciton() {} )
	* A model can then extend this my including "self = this;" and "angular.extend(self, AbstractModel);"
	* in its contructor.
	*/
	AbstractModel.unwrap = function(self, futureData, modelString) {
		if(!futureData.$$state) {
			angular.extend(self, futureData);
			return;
		}
		futureData.then(
			function(data) {
				if(data.body) {
					angular.extend(self, JSON.parse(data.body).payload[modelString]);
					if(JSON.parse(data.body).meta.type == "ERROR") {
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
					angular.extend(self, JSON.parse(data.body).payload[modelString]);
				}
				else {
					angular.extend(self, {'value':data});
				}
		});
	};

	AbstractModel.update = function(self, promise, modelString) {
		promise.then(function(data) {
			if(typeof JSON.parse(data.body).payload[modelString] != 'undefined') {
				self.unwrap(self, JSON.parse(data.body).payload[modelString], modelString);
			}
			else {
				console.log(modelString + ' is undefined');
				console.log(data);
			}
		});
	};
	
	return AbstractModel;

});