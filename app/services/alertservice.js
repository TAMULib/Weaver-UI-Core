core.service("AlertService", function() {

	var AlertService = this;

	var removedIds = [];

	var Alert = function(alertType, alertMessage, channel) {

		this.id = removedIds.length == 0 ? AlertService.store.all.length : removedIds.pop() ;
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

	AlertService.store = {
		'all': [],
		'active': [],
		'inactive': []
	}

	AlertService.add = function(meta, channel) {
		console.log(meta)
		var newAlert = new Alert(meta.type, meta.message, channel);
		AlertService.store.all.push(newAlert);
		AlertService.store.active.push(newAlert);
	}

	AlertService.activate = function(id) {
		var errorToActivate = AlertService.store.all[id];
		AlertService.store.inactive.splice(AlertService.store.inactive.indexOf(errorToActivate), 1);
		AlertService.store.active.push(errorToActivate);
	}

	AlertService.deactivate = function(id) {
		var errorToDeactivate = AlertService.store.all[id];
		AlertService.store.active.splice(AlertService.store.active.indexOf(errorToDeactivate), 1);
		AlertService.store.inactive.push(errorToDeactivate);	
	}
	
});
