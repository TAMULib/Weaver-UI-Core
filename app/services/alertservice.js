/**
 * 
 * @ngdoc service
 * @name  core.service:AlertService
 * @requires ng.$q
 * @requires ng.$interval
 *
 * @description
 * 	Alert service which tracks responses from the web socket API.
 * 	Stores responses categorized by type, controller, or endpoint. The id is popped 
 * 	from an array of keys(sequential integers) and recycled upon removal
 * 	of the alert. Old alerts removed using an interval.
 *
 */
core.service("AlertService", function($q, $interval) {

	var AlertService = this;
	
	/**
	 * @ngdoc property
	 * @name  core.service:AlertService#types
	 * @propertyOf core.service:AlertService
	 *
	 * @description 
	 *  The available alert types. These are declared in the
	 *  {@link coreConfig coreConfig}
	 * 
	 */
	var types = coreConfig.alerts.types;

	/**
	 * @ngdoc property
	 * @name  core.service:AlertService#classes
	 * @propertyOf core.service:AlertService
	 *
	 * @description 
	 *  The classes to be apploed to each alert type. These are declared in the
	 *  {@link coreConfig coreConfig}
	 * 
	 */
	var classes = coreConfig.alerts.classes;

	/**
	 * @ngdoc property
	 * @name  core.service:AlertService#store
	 * @propertyOf core.service:AlertService
	 *
	 * @description 
	 *  An object to store alerts.
	 * 
	 */
	var store = { };
	
	// create the promises and lists for the possible types
	for(var t in types) {
		store[types[t]] = {
			defer: $q.defer(),
			list: [],
			exclusive: false
		};
	}

	var keys = [];

	// create the initial keys
	for(var id = 0; id < 1000; id++) {
		keys.push(id);
	}

	/**
	 * @ngdoc method
	 * @name  core.service:AlertService#Alert
	 * @methodOf core.service:AlertService
	 * @param {string} message 
	 * 	message on the API response
	 * @param {string} type 
	 * 	mapped response type on the API response
	 * @param {string} channel 
	 * 	channel on which the response returned
	 * @returns {Alert} returns a new Alert.
	 *
	 * @description
	 * 	Constructor for an Alert.
	 */
	var Alert = function(message, type, channel) {
		this.id = keys.pop();
		this.message = message ? message : '';
		this.type = type ? type : 'UNKNOWN';
		this.channel = channel ? channel : 'unassigned';
		this.time = new Date().getTime();
		if(typeof classes[type] == 'undefined') {
			this.class = classes['DEFAULT'];
		}
		else {
			this.class = classes[type];
		}
		return this;
	};
	
	/**
	 * 
	 * @ngdoc method
	 * @name  core.service:AlertService#AlertService.create
	 * @methodOf core.service:AlertService
	 * @param {string} facet
	 *  either type, controller, or endpoint
	 * 
	 * @description
	 *  Method to create a store with the given facet.
	 *	 
	 */
	AlertService.create = function(facet) {
		isNew(facet, false);
	};

	/**
	 *
	 * @ngdoc method
	 * @name  core.service:AlertService#AlertService.get
	 * @methodOf core.service:AlertService
	 * @param {string} facet
	 *  either type, controller, or endpoint
	 * @return {object} 
	 *  returns store object containing promise and current list of alerts
	 * 
	 * @description 
	 *  Method to get a store from the alert service.
	 *  A store consists of the promise and a list of alerts.
	 *  
	 */
	AlertService.get = function(facet, exclusive) {
		if(typeof facet == 'undefined') return [];
		isNew(facet, exclusive);
		return store[facet];
	};

	/**
	 * @ngdoc method
	 * @name  core.service:AlertService#AlertService.add
	 * @methodOf core.service:AlertService
	 * @param {object} meta
	 *  An API response meta containing message and type
	 * @param {string} channel
	 *  The channel on which the response returned
	 *
	 * @description 
	 *  Method to add an alert to the appropriate stores.
	 *  Adds to both the store for type and store for channel. 
	 * 
	 */
	AlertService.add = function(meta, channel) {

		isNew(channel);

		var alert = new Alert(meta.message, meta.type, channel);

		var endpoint = channel;
		
		// add alert to store by endpoint
		if(filter(endpoint, meta, channel).length == 0) {
			store[endpoint].list.push(alert);
			store[endpoint].defer.notify(alert);
			if(store[endpoint].exclusive) return;
		}
		
		var controller = channel.substr(0, channel.lastIndexOf("/"));

		// add alert to store by controller
		if(filter(controller, meta).length == 0) {
			store[controller].list.push(alert);
			store[controller].defer.notify(alert);
			if(store[controller].exclusive) return;
		}

		// add alert to store by type
		if(filter(meta.type, meta, channel).length == 0) {
			store[meta.type].list.push(alert);
			store[meta.type].defer.notify(alert);
		}

	};

	AlertService.removeAll = function(facet) {
		console.log(store[facet].list)
		if(typeof store[facet] != 'undefined') {
			for(var i = store[facet].list.length - 1; i >= 0; i--) {
				AlertService.remove(store[facet].list[i]);
			}
		}
	};
	
	/**
	 * 
	 * @ngdoc method
	 * @name  core.service:AlertService#AlertService.remove
	 * @methodOf core.service:AlertService
	 * @param {object} alert
	 *  The Alert to bew removed;
	 *
	 * @description 
	 *  Method to remove an alert from the store.
	 *  Removes from both type store, controller store, and endpoint store.
	 * 
	 */
	AlertService.remove = function(alert) {

		alert.remove = true;
							
		// remove alert from store by type
		if(typeof store[alert.type] != 'undefined') {
			for(var i in store[alert.type].list) {
				if(store[alert.type].list[i].id = alert.id) {
					store[alert.type].defer.notify(alert);
					store[alert.type].list.splice(i, 1);
					break;
				}
			}
		}
		
		
		var endpoint = alert.channel;
		
		// remove alert from store by endpoint
		if(typeof store[endpoint] != 'undefined') {
			for(var i in store[endpoint].list) {
				if(store[endpoint].list[i].id = alert.id) {
					store[endpoint].defer.notify(alert);
					store[endpoint].list.splice(i, 1);
					break;
				}
			}
		}

		var controller = alert.channel.substr(0, alert.channel.lastIndexOf("/"));
		
		// remove alert from store by controller 
		if(typeof store[controller] != 'undefined') {
			for(var i in store[controller].list) {
				if(store[controller].list[i].id = alert.id) {
					store[controller].defer.notify(alert);
					store[controller].list.splice(i, 1);
					break;
				}
			}
		}

		keys.push(alert.id);
	};
	
	/**
	 * @ngdoc method
	 * @name  core.service:AlertService#filter
	 * @methodOf core.service:AlertService
	 * @param {string} facet
	 *  type, controller, or endpoint
	 * @param {object} meta
	 *  API response meta containing type and message
	 * @param {string} channel
	 *  on which the response returned
	 * @return {array} returns array of duplicates with specified values
	 *
	 * @description
	 *  Method to check to see if store already contains
	 *  alert with same type, message, and channel.
	 * 
	 */
	var filter = function(facet, meta, channel) {
		if(isNew(facet)) return store[facet];
		return store[facet].list.filter(function(alert) {
			var channelMatch = typeof channel != 'undefined' ? alert.channel == channel : true;
			return alert.type == meta.type &&
			   	   alert.message == meta.message &&
			       channelMatch;
		});
	};
	
	/**
	 * 
	 * @ngdoc method
	 * @name core.service:AlertService#isNew
	 * @methodOf core.service:AlertService
	 * @param {object} facet
	 *  either type, controller, or endpoint
	 * @return {boolean}
	 *  whether the store is new
	 *	
	 * @description 
	 *  Method to check if the store for the specific facet exists.
	 *  If not, creates store.
	 *  
	 */
	var isNew = function(facet, exclusive) {
		if(typeof store[facet] == 'undefined') {
			store[facet] = {
				defer: $q.defer(),
				list: [],
				exclusive: exclusive
			};
			return true;
		}
		return false
	};
	
	// remove old alerts and recycle keys
	$interval(function() {
	
		var now = new Date().getTime();
		
		var recycle = [];
		
		for(var t in store) {
			// do not flush errors
			if(t != 'ERROR') {			
				for(var j = store[t].list.length-1; j >= 0; j--) {
					
					var alert = store[t].list[j];
				
					if(alert.time < now - (coreConfig.alerts.flush/2)) {
						
						alert.remove = true;
						
						store[t].defer.notify(alert);
						store[t].list.splice(j, 1);
						
						// don't recycle the same id twice
						if(recycle.indexOf(alert.id) < 0) {
							recycle.push(alert.id);
						}
					}
				}
			}
		}
		
		keys = keys.concat(recycle);
		
	}, coreConfig.alerts.flush);
							
});
