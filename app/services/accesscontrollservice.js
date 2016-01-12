core.service("AccessControllService", function($location, StorageService) {

	var AccessControllService = this;

	AccessControllService.lastRoutePath = ""

	AccessControllService.checkRoute = function(evt, next, current) {

		var allowedUsers = next.$$route.access;
		var role = StorageService.get("role");

		var restrict = allowedUsers ? allowedUsers.indexOf(role) == -1 : false;

		console.log(current);

		if(typeof(current) != "undefined")
			AccessControllService.lastRoutePath = current.$$route.orinialPath;

		if(restrict) {
			evt.preventDefault();
			$location.path("/403");
		}
		
	};

	AccessControllService.getLastRoutePath = function() {
		return AccessControllService.lastRoutePath
	}

});