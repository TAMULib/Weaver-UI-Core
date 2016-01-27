/**
 *
 * @ngdoc service
 * @name  core.service:AbstractModel
 * @constructor
 * @param {object} data The models data, from the webservice, to be extended onto the model itself.
 * @returns {service} AbsrtactModel returns the AbstractModel
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
core.service("AbstractModel", function () {


	/**
	 * @constructor
 	 * @param {object} data The models data, from the webservice, to be extended onto the model itself.
 	 * @returns {service} AbsrtactModel returns the AbstractModel
 	 * 
 	 * @description
	 * 	The constructor for the Abstract Service.
	 */
	var AbstractModel = function(data) {
		angular.extend(this, data);
	};

	/**
	 * @ngdoc method
	 * @name unwrap
	 * @methodOf core.service:AbstractModel
	 * @param {service} self the model which is unwrapping the data
	 * @param {Promise|object} futureData the promise of future data, or the data object
	 * @returns {void} returns void
	 *
	 * @description
	 * 	Unwraps future data and extends it onto the inheriting model.
	 * 
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

	/**
	 * @ngdoc method
	 * @name update
	 * @methodOf core.service:AbstractModel
	 * @param {service} self the model which is unwrapping the data
	 * @param {Promise} promise the promise of future data
	 * @returns {void} returns void
	 *
	 * @description
	 * 	Unwraps the promise and re-extends it onto the inheriting model.
	 * 
	 */
	AbstractModel.update = function(self, promise) {
		promise.then(function(data) {
			var response = JSON.parse(data.body);
			var payload = response.payload;
			var meta = response.meta;
			var keys = Object.keys(payload);
			for(var i in keys) {
				if(typeof payload[keys[i]] != 'undefined') {
					self.unwrap(self, payload[keys[i]]);
				}
				else {
					console.log(keys[i] + ' is undefined');
					console.log(data);
				}
			}			
		});
	};
	
	return AbstractModel;

});