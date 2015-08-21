core.service("StorageService",function($q, AbstractModel) { 
	
	var StorageService = this;

	var Data = function(futureData) {
		self = this;
		angular.extend(self, AbstractModel);
		self.unwrap(self, futureData);
	};
	
	StorageService.storage = {
		'session': window['sessionStorage'],
		'local': window['localStorage']
	} 

	StorageService.keys = {
		'session': {},
		'local': {}
	}

	StorageService.set = function(key, value, type) {
		if(!type) {
			type = appConfig.storageType;
		}
		if(!StorageService.keys[type][key]) {
			StorageService.keys[type][key] = $q.defer();			
		}
		StorageService.storage[type][key] = value;
		StorageService.keys[type][key].notify(StorageService.storage[type][key]);
	}

	StorageService.get = function(key, type) {
		if(!type) {
			type = appConfig.storageType;
		}
		return StorageService.storage[type][key];
	}

	StorageService.listen = function(key, type) {
		if(!type) {
			type = appConfig.storageType;
		}
		if(!StorageService.keys[type][key]) {
			StorageService.keys[type][key] = $q.defer();
		}
		var data = new Data(StorageService.keys[type][key].promise);
		return data;
	}

	StorageService.delete = function(key, type) {
		if(!type) {
			type = appConfig.storageType;
		}
		StorageService.keys[type][key].notify(null);
		delete StorageService.keys[type][key];
		delete StorageService.storage[type][key];
	}

	for(var type in {'session':'0', 'local':'1'}) {
		for(var key in StorageService.storage[type]) {
			StorageService.keys[type][key] = $q.defer();
			StorageService.keys[type][key].notify(StorageService.storage[type][key]);
			StorageService.set(key, StorageService.storage[type][key], type);
		}
	}

});
