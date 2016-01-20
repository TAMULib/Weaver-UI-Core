/**
 *
 * @ngdoc service
 * @name  core.service:AssumedControl 
 * @requires $scope
 * @constructor
 * @param {object} data The models data, from the webservice, to be extended onto the model itself.
 * @returns {service} AssumedControl returns AssumedControl
 * 
 * @example
 * The following must be added to a model for it to extending this AbstractModel
 * <pre>
 *  angular.extend(self, AbstractModel); 
 * </pre>
 * 	
 * @description
 *	This abstract model should be inherited by all models using
 * 	the TAMU-UI-Core. It exposes unwrapping capabilites. All abstracted methods can go here: (e.g. AbstractModel.myMethod = funciton() {} )
 *	A model can then extend this my including "self = this;" and "angular.extend(self, AbstractModel);"
 * 	in its contructor.
 * 
 */
core.service("AssumedControl", function($q, AbstractModel, AuthServiceApi, StorageService) {

	var self;

	var initiliazed = false;
	var set = false;
	var locked = false;
	/**
	 * @constructor
 	 * @param {object} data The models data, from the webservice, to be extended onto the model itself.
 	 * @returns {service} AssumedControl returns AssumedControl object
 	 * 
 	 * @description
	 * 	The constructor for the AssumedControl Service.
	 */
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
		
		if(!initiliazed) {
			initiliazed = true;
			if(StorageService.get("assumed") != 'true') {
				StorageService.set('assumed', 'false');
			}
			if(StorageService.get("assuming") != 'true') {
				StorageService.set('assuming', 'false');
			}
		}

		var newAssumedControlPromise = $q.defer();

		AssumedControl.promise = newAssumedControlPromise;

		if(AssumedControl.data) {
			AssumedControl.promise.resolve();
		}
		else {
			AssumedControl.data = new AssumedControl(newAssumedControlPromise);
		}

		return AssumedControl.data;	
	};

	AssumedControl.ready = function() {
		return AssumedControl.promise;
	};

	AssumedControl.assume = function(user, services) {
		return $q(function(resolve) {

			if (!locked) {
				
				locked = true;

				logger.log("Assuming user");

				StorageService.set('assumedUser', JSON.stringify(user));

				StorageService.set('assuming', 'true');

				StorageService.set('adminToken', StorageService.get("token"));

				AuthServiceApi.getAssumedUser(user).then(function(response) {

					if(response.data.assumed) {

						if(response.data) {

							for(var i in services) {
								services[i].refresh();
							}

							StorageService.set('assumed', 'true');

							AssumedControl.set({
								'netid': user.netid,
								'button': 'Unassume User',
								'status': 'assumed'
							});

							resolve(true);

						}
						else {

							StorageService.set('assuming', 'false');

							AssumedControl.set({
								'netid': user.netid,
								'button': 'Assume User',
								'status': 'invalid netid'
							});

							resolve(false);
						}
						
					}
					else {
						StorageService.set('assuming', 'false');

						AssumedControl.set({
							'netid': user.netid,
							'button': 'Assume User',
							'status': 'invalid netid'
						});

						resolve(false);
					}

				});

				locked = false;
			}

		});
	};

	AssumedControl.unassume = function(user, services, role) {
		return $q(function(resolve) {

			if (!locked) {

				locked = true;

				logger.log("Unassuming user");

				StorageService.delete('assumedUser');
				StorageService.set('assuming', 'false');
				StorageService.set('token', StorageService.get("adminToken"));
				
				AssumedControl.set({
					'netid': '',
					'button': 'Assume User',
					'status': ''
				});

				for(var i in services) {
					services[i].refresh();
				}

				StorageService.set('assumed', 'false');

				StorageService.set("role", role);

				locked = false;	
			}

		});
	};

	return AssumedControl;
	
});
