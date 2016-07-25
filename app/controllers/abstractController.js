/**
 * @ngdoc controller
 * @name core.controller:AbstractController
 * @requires $scope
 * @requires $window
 * @requires core.service:StorageService
 * @requires core.service:RestApi
 *
 * @example
 * The following must be added to a controller for it to extending this AbstractController
 *	<pre>
 *		angular.extend(this, $controller('AbstractController', {$scope: $scope}));
 *	</pre>
 *
 * @description
 *	This abstract controller should be inherited by all controllers using
 * 	the TAMU-UI-Core. It exposes access control methods as well as error 
 *	reporting functionality.
 *
**/
core.controller('AbstractController', function ($scope, $window, ModalService, StorageService, RestApi) {

	angular.extend($scope, ModalService);
	
	/**
	 * @ngdoc property
	 * @name core.controller:AbstractController#$scope.storage
	 * @propertyOf core.controller:AbstractController
	 *
	 * @description
	 * 	The StorageService for the scope of the Abstract Controller
	 */
	$scope.storage = StorageService;
	
	/**
	 * @ngdoc method
	 * @name core.controller:AbstractController#$scope.isAssumed
	 * @methodOf core.controller:AbstractController
	 * @returns {boolean} returns a boolean
	 * 
	 * @description
	 *	A boolean indicating if the current user is acutually an adminstrator assuming that user's identity.
	 */
	$scope.isAssumed = function() {
		return StorageService.get("assumed");
	};

	/**
	 * @ngdoc method
	 * @name core.controller:AbstractController#$scope.isAssuming
	 * @methodOf core.controller:AbstractController
	 * @returns {boolean} returns a boolean
	 * 
	 * @description
	 * 	A boolean indicating if the current user is in the process of assuming another user.
	 */
	$scope.isAssuming = function() {
		return StorageService.get("assuming");
	};

	/**
	 * @ngdoc method
	 * @name core.controller:AbstractController#$scope.isAnonymous
	 * @methodOf core.controller:AbstractController
	 * @returns {boolean} returns a boolean
	 * 
	 * @description
	 * 	A boolean indicating that the current user is browsing anonymously.
	 */
	$scope.isAnonymous = function() {
		return (sessionStorage.role == appConfig.anonymousRole);
	};

	/**
	 * @ngdoc method
	 * @name core.controller:AbstractController#$scope.isUser
	 * @methodOf core.controller:AbstractController
	 * @returns {boolean} returns a boolean
	 * 
	 * @description
	 * 	A boolean indicating that the current user is browsing with a role of 'ROLE_USER'.
	 */
	$scope.isUser = function() {
		return (sessionStorage.role == "ROLE_USER");
	};

	/**
	 * @ngdoc method
	 * @name core.controller:AbstractController#$scope.isAnnotator
	 * @methodOf core.controller:AbstractController
	 * @returns {boolean} returns a boolean
	 * 
	 * @description
	 * 	A boolean indicating that the current user is browsing with a role of 'ROLE_ANNOTATOR'.
	 */
	$scope.isAnnotator = function() {
		return (sessionStorage.role == "ROLE_ANNOTATOR");
	};

	/**
	 * @ngdoc method
	 * @name core.controller:AbstractController#$scope.isManager
	 * @methodOf core.controller:AbstractController
	 * @returns {boolean} returns a boolean
	 * 
	 * @description
	 * 	A boolean indicating that the current user is browsing with a role of 'ROLE_MANGER'.
	 */
	$scope.isManager = function() {
		return (sessionStorage.role == "ROLE_MANAGER");
	};

	/**
	 * @ngdoc method
	 * @name core.controller:AbstractController#$scope.isAdmin
	 * @methodOf core.controller:AbstractController
	 * @returns {boolean} returns a boolean
	 * 
	 * @description
	 * 	A boolean indicating that the current user is browsing with a role of 'ROLE_ADMIN'.
	 */
	$scope.isAdmin = function() {
		return (sessionStorage.role == "ROLE_ADMIN");
	};

	/**
	 * @ngdoc method
	 * @name core.controller:AbstractController#$scope.reportError
	 * @methodOf core.controller:AbstractController
	 * @param {Alert} alert an alert object
	 * @returns {void} returns void
	 * 
	 * @description
	 * 	Initiates a rest api call to report an error to the Webservice.
	 */
	$scope.reportError = function(alert) {
		RestApi.post({
			controller: 'report', 
			method: 'error',
			data: alert
		}).then(function() {
			angular.element("#reportModal").modal('show');
		}, function(response) {
			if(response.data == null || response.data.message != "EXPIRED_JWT") {
				var subject = 'Error Report';
				var body = 'Error Report\n\nchannel: ' + alert.channel +
						   '\ntime: ' + new Date(alert.time) +
						   '\ntype: ' + alert.type + 
						   '\nmessage: ' + alert.message;
	    		$window.location.href = "mailto:"+ coreConfig.alerts.email + 
	    							    "?subject=" + escape(subject) + 
	    								"&body=" + escape(body); 
			}
		}, function() {
			
		});
	};

});
