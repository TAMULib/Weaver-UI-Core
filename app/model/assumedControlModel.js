core.service("AssumedControl", function($q, AbstractModel, AuthServiceApi, StorageService) {

	var self;

	var initiliazed = false;
	var set = false;
	var locked = false;

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
