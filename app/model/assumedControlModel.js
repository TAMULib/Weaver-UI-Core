core.service("AssumedControl", function($q, AbstractModel) {

	var self;

	var AssumedControl = function(data) {
		self = this;
		angular.extend(self, AbstractModel);
		self.unwrap(self, data);
	};
	
	AssumedControl.data = null;

	AssumedControl.promise = null;
	
	AssumedControl.set = function(data) {
		self.unwrap(self, data);
		AssumedControl.promise.resolve();
	};

	AssumedControl.get = function() {	
		var newAssumedControlPromise = $q.defer();
		AssumedControl.data = new AssumedControl(newAssumedControlPromise);		
		AssumedControl.promise = newAssumedControlPromise;
		return AssumedControl.data;	
	};

	AssumedControl.ready = function() {
		return AssumedUser.promise;
	};

	return AssumedControl;
	
});
