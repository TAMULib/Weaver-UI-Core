/**
 * @ngdoc service
 * @name  core.service:StorageService
 * @requires ng.$q
 * @requires core.service:AbstractModel
 *
 * @description
 * 	An angular service wraper for local and session storage.
 * 
 */
core.service("StorageService",function($q) { 
	
	var StorageService = this;
	
	/**
	 * @ngdoc property
	 * @name  core.service:StorageService#StorageService.storage
	 * @propertyOf core.service:StorageService
	 *
	 * @description
	 *  An object store for both local and session storage.
	 * 
	 */
	StorageService.storage = {
		'session': window['sessionStorage'],
		'local': window['localStorage']
	} 

	/**
	 * @ngdoc property
	 * @name  core.service:StorageService#StorageService.keys
	 * @propertyOf core.service:StorageService
	 *
	 * @description
	 *  The in memory store of session and local storage key/value pares.
	 * 
	 */
	StorageService.keys = {
		'session': {},
		'local': {}
	}

	/**
	 * @ngdoc method
	 * @name  core.service:StorageService#StorageService.set
	 * @methodOf core.service:StorageService
	 * @param {string} key 
	 *  The key which you would like to persist in browser storage.
	 * @param {string} value 
	 *  The value to persist in browser storage
	 * @param {string=} type
	 *  An optional override to the default browser storage, which
	 *  will be local or session.
	 *
	 * @description
	 *  A setter for browser storage.
	 * 
	 */
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

	/**
	 * @ngdoc method
	 * @name  core.service:StorageService#StorageService.get
	 * @methodOf core.service:StorageService
	 * @param {string} key 
	 *  The key for the value you wish to return from browser storage.
	 * @param {string=} type
	 *  An optional override to the default browser storage, which
	 *  will be local or session.
	 *  
	 * @description
	 *  A getter for values browser storage.
	 * 
	 */
	StorageService.get = function(key, type) {
		if(!type) {
			type = appConfig.storageType;
		}
		return StorageService.storage[type][key];
	}

	/**
	 * @ngdoc method
	 * @name  core.service:StorageService#StorageService.listen
	 * @methodOf core.service:StorageService
	 * @param {string} key 
	 *  The key for the value you wish to listen for.
	 * @param {string=} type
	 *  An optional override to the default browser storage, which
	 *  will be local or session.
	 * @returns {Promise} returns a promise notified on the change 
	 *  of the indicated browser storage value.
	 *  
	 * @description
	 *  A listener which provides a promise for the updating
	 *  of the designated browser storage value.
	 * 
	 */
	StorageService.listen = function(key, type) {
		if(!type) {
			type = appConfig.storageType;
		}
		if(!StorageService.keys[type][key]) {
			StorageService.keys[type][key] = $q.defer();
		}
		var data = {};		
		StorageService.keys[type][key].promise.then(null, null, function(promisedData) {
			console.log(promisedData);
			angular.extend(data, promisedData);
		})
		return data;
	}

	/**
	 * @ngdoc method
	 * @name  core.service:StorageService#StorageService.delete
	 * @methodOf core.service:StorageService
	 * @param {string} key 
	 *  The key for the value you wish to delete.
	 * @param {string=} type
	 *  An optional override to the default browser storage, which
	 *  will be local or session.
	 *  
	 * @description
	 *  Deletes a value from browser storage.
	 * 
	 */
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
