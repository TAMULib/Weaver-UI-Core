core.service("AccessControllService", function($location, StorageService) {

	var AccessControllService = this;

	AccessControllService.checkRoute = function(evt, next) {

		var allowedUsers = next.$$route.access;
		var role = StorageService.get("role");

		var restrict = allowedUsers ? allowedUsers.indexOf(role) == -1 : false;


		if(restrict) {
			evt.preventDefault();
			$location.path("/403");
		}
		
	};

});