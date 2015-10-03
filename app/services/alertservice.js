/*
 * Alert service in which tracks responses from the web socket API.
 * Stores responses categorized by channel and type. The id is popped 
 * from an array of keys(sequential integers) and recycled upon removal
 * of the alert. Remove old alerts using an interval.
 *
 */
core.service("AlertService", function($q, $interval) {

	var AlertService = this;
	
	var alerts = coreConfig.alerts;
	var classes = coreConfig.classes;

	var store = { };
	
	// create the promises and lists for the possible types
	for(var type in alerts) {
		store[alerts[type]] = {
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
	 * Method to get a store from the alert service.
	 * A store consists of the promise and a list of alerts.
	 *
	 * @param facet
	 *		either type or a channel 
	 */
	AlertService.get = function(facet) {
		if(typeof facet == 'undefined') return store;
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
		
		var alert = new Alert(meta.message, meta.type, channel);
		
		// add alert to store by type
		if(check(meta.type, meta, channel).length == 0) {
			store[meta.type].list.push(alert);
			store[meta.type].defer.notify(alert);
		}
		
		// add alert to store by channel
		if(check(channel, meta, channel).length == 0) {
			store[channel].list.push(alert);
			store[channel].defer.notify(alert);
		}
	};
	
	/*
	 * Method to remove an alert from the store.
	 * Removes from both type store and channel store.
	 *
	 * @param alert
	 *		Alert 
	 */
	AlertService.remove = function(alert) {
					
		// remove alert from store by type
		for(var i in store[alert.type].list) {
			if(store[alert.type].list[i].id = alert.id) {
				alert.remove = true;
				store[alert.type].defer.notify(alert);
				// do not remove error alerts
				if(alert.type != "ERROR") {
					store[alert.type].list.splice(i, 1);
				}
				break;
			}
		}
		
		// remove alert from store by channel
		for(var i in store[alert.channel].list) {
			if(store[alert.channel].list[i].id = alert.id) {
				alert.remove = true;
				store[alert.channel].defer.notify(alert);
				// do not remove error alerts
				if(alert.type != "ERROR") {
					store[alert.channel].list.splice(i, 1);
				}
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
	 *		string either type or a channel 
	 * @param meta
	 *		API response meta containing message and type
	 * @param channel
	 *		string channel on which the response returned
	 */
	var check = function(facet, meta, channel) {	
		if(isNew(facet)) return [];		
		return store[facet].list.filter(function(alert) {
			return alert.type == meta.type &&
			   	   alert.message == meta.message &&
			       alert.channel == channel;
		});
	};
	
	/*
	 * Method to check it the store for the specific facet exists.
	 * If not, creates store.
	 *
	 * @param facet
	 *		either type or a channel 
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
				
					if(alert.time < now - (coreConfig.flush/2)) {
						
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
		
	}, coreConfig.flush);
							
});
