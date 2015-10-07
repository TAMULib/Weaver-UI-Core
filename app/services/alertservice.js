/*
 * Alert service which tracks responses from the web socket API.
 * Stores responses categorized by type, controller, or endpoint. The id is popped 
 * from an array of keys(sequential integers) and recycled upon removal
 * of the alert. Old alerts removed using an interval.
 *
 */
core.service("AlertService", function($q, $interval) {

	var AlertService = this;
	
	var types = coreConfig.alerts.types;
	var classes = coreConfig.alerts.classes;

	var store = { };
	
	// create the promises and lists for the possible types
	for(var t in types) {
		store[types[t]] = {
			defer: $q.defer(),
			list: [],
		};
	}

	var keys = [];

	// create the initial keys
	for(var id = 0; id < 1000; id++) {
		keys.push(id);
	}

	/*
	 * Constructor for an Alert.
	 *
	 * @param message 
	 *		string message on the API response
	 * @param type
	 *		string mapped response type on the API response
	 * @param channel
	 *		string channel on which the response returned
	 * @return
	 *		new Alert
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
	
	/*
	 * Method to create a store with the given facet.
	 *
	 * @param facet
	 *		either type, controller, or endpoint
	 */
	AlertService.create = function(facet) {
		isNew(facet);
	};

	/*
	 * Method to get a store from the alert service.
	 * A store consists of the promise and a list of alerts.
	 *
	 * @param facet
	 *		either type, controller, or endpoint
	 * @return
	 *		store object containing promise and current list of alerts
	 */
	AlertService.get = function(facet) {
		if(typeof facet == 'undefined') return [];
		isNew(facet);
		return store[facet];
	};

	/*
	 * Method to add an alert to the appropriate stores.
	 * Adds to both the store for type and store for channel. 
	 *
	 * @param meta
	 *		API response meta containing message and type
	 * @param channel
	 *		string channel on which the response returned
	 */
	AlertService.add = function(meta, channel) {

		isNew(channel);

		var alert = new Alert(meta.message, meta.type, channel);

		// add alert to store by type
		if(filter(meta.type, meta, channel).length == 0) {
			store[meta.type].list.push(alert);
			store[meta.type].defer.notify(alert);
		}
		
		var endpoint = channel;
		
		// add alert to store by endpoint
		if(filter(endpoint, meta, channel).length == 0) {
			store[endpoint].list.push(alert);
			store[endpoint].defer.notify(alert);
		}
		
		var controller = channel.substr(0, channel.lastIndexOf("/"));

		// add alert to store by controller
		if(filter(controller, meta).length == 0) {
			store[controller].list.push(alert);
			store[controller].defer.notify(alert);
		}

	};
	
	/*
	 * Method to remove an alert from the store.
	 * Removes from both type store, controller store, and endpoint store.
	 *
	 * @param alert
	 *		Alert 
	 */
	AlertService.remove = function(alert) {

		alert.remove = true;
							
		// remove alert from store by type
		for(var i in store[alert.type].list) {
			if(store[alert.type].list[i].id = alert.id) {
				store[alert.type].defer.notify(alert);
				store[alert.type].list.splice(i, 1);
				break;
			}
		}
		
		var endpoint = alert.channel;
		
		// remove alert from store by endpoint
		for(var i in store[endpoint].list) {
			if(store[endpoint].list[i].id = alert.id) {
				store[endpoint].defer.notify(alert);
				store[endpoint].list.splice(i, 1);
				break;
			}
		}
		
		var controller = alert.channel.substr(0, alert.channel.lastIndexOf("/"));
		
		// remove alert from store by controller 
		for(var i in store[controller].list) {
			if(store[controller].list[i].id = alert.id) {
				store[controller].defer.notify(alert);
				store[controller].list.splice(i, 1);
				break;
			}
		}

		keys.push(alert.id);
	};
	
	/*
	 * Method to check to see if store already contains
	 * alert with same type, message, and channel.
	 *
	 * @param facet
	 *		string type, controller, or endpoint
	 * @param meta
	 *		API response meta containing type and message
	 * @param channel
	 *		string channel on which the response returned
	 * @return
	 *		returns array of duplicates with specified values
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
	
	/*
	 * Method to check if the store for the specific facet exists.
	 * If not, creates store.
	 *
	 * @param facet
	 *		either type, controller, or endpoint
	 * @return
	 *		boolean whether the store is new
	 */
	var isNew = function(facet) {
		if(typeof store[facet] == 'undefined') {
			store[facet] = {
				defer: $q.defer(),
				list: [],
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
