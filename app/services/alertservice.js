core.service("AlertService", function() {

	var AlertService = this;

	var store = {
		'all': [],
		'active': [],
		'inactive': []
	}

	var removedIds = [];

	var Alert = function(alertType, alertMessage, channel) {

		this.id = removedIds.length == 0 ? store.all.length : removedIds.pop() ;
		this.type = alertType;
		
		switch (alertType) {
		    case "ERROR":
		        this.class = "danger";
		        break;
		    case "WARNING":
		        this.class = "warning";
		        break;
		    case "SUCCESS":
		        this.class = "success";
		        break;
		    default:
		        this.class = "info";
		        break;
		}

		this.alertType = alertType;
		this.alertMessage = alertMessage ? alertMessage : "";
		this.channel = channel ? channel : null;
		this.time = new Date().getTime();

		return this;
	};

	AlertService.get = function(type) {
		if(!type) return store.all;
		return store[type];
	}

	AlertService.add = function(meta, channel) {
		var newAlert = new Alert(meta.type, meta.message, channel);
		store.all.push(newAlert);
		store.active.push(newAlert);
	}

	AlertService.activate = function(id) {
		var errorToActivate = store.all[id];
		store.inactive.splice(store.inactive.indexOf(errorToActivate), 1);
		store.active.push(errorToActivate);
	}

	AlertService.deactivate = function(id) {
		var errorToDeactivate = store.all[id];
		store.active.splice(store.active.indexOf(errorToDeactivate), 1);
		store.inactive.push(errorToDeactivate);	
	}
	
});
