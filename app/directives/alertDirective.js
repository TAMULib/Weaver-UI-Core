/**
* @ngdoc directive
* @name  core.directive:alerts
* @restrict 'E'
* @requires AlertService
* @requires $controller
* @requires $rootScope
* @requires $timeout
*
* @example
* <pre>
* 	<alerts types="WARNING, ERROR"><ul class="alertList list-unstyled"><!-- ngRepeat: alert in alerts --></ul></alerts>
* </pre>
* 
* @description 
* The alerts element directive is used to provide alert messages based on the alert types in your application. Extends {@link core.controller:AbstractController 'AbstractController'}
* 
*/
core.directive('alerts', function (AlertService, $controller, $rootScope, $timeout) {
	return {
		template: '<ul class="alertList list-unstyled"><li ng-repeat="alert in alerts" class="alertEntry"><span ng-include src="view"></span></li></ul>',
		restrict: 'E',
		replace: false,
		scope: {},
		link: function ($scope, element, attr) {

			angular.extend(this, $controller('AbstractController', {$scope: $scope}));
		    /**
		     * @ngdoc property
		     * @name fixed
		     * @propertyOf core.directive:alerts#fixed
		     *
		     * @description
		     * A variable to store the boolean result if the element 'fixed' is present in the attr object
		     */
			var fixed = Object.keys(attr).indexOf('fixed') > -1;
			
			/**
		     * @ngdoc property
		     * @name duration
		     * @propertyOf core.directive:alerts#duration
		     *
		     * @description
		     * A variable to store the duration value either from the 'attr' object or the coreConfig alerts 'duration'
		     */
			var duration = attr.seconds ? parseInt(attr.seconds) * 1000: coreConfig.alerts.duration;
			
			var types = [];
			var channels = [];

			if(attr.types) {
				var splitTypes = attr.types.split(',');
				for(var i in splitTypes) {
					types.push(splitTypes[i].trim());
				}
			}

			if(types.length == 0) {
				types.push("ERROR");
			}
			
			if(attr.channels) {
				var splitChannels = attr.channels.split(',');
				for(var i in splitChannels) {
					channels.push(splitChannels[i].trim());
				}
			}

			/**
		     * @ngdoc property
		     * @name facets
		     * @propertyOf core.directive:alerts#facets
		     *
		     * @description
		     * An array variable to store the 'types' and 'channel' attributes from the 'attr' object
		     */			
			var facets = [];
			
			facets = facets.concat(types ? types : []);
			facets = facets.concat(channels ? channels : []);

			var timers = {};

			/**
			 * @ngdoc property
			 * @name core.directives:alerts#$scope.view
			 * @propertyOf core.directives:alerts
			 *
			 * @description
			 * 	A variable to store the 'attr' object 'view' property if present else it points to the 'defaultalert' view
			 */			
			$scope.view = attr.view ? attr.view : "bower_components/core/app/views/alerts/defaultalert.html";

			/**
			 * @ngdoc property
			 * @name core.directives:alerts#$scope.alerts
			 * @propertyOf core.directives:alerts
			 *
			 * @description
			 * 	An array variable to store the alert messages
			 */
			$scope.alerts = [];

			/**
			 * @ngdoc method
			 * @name core.directives:alerts#$scope.remove
			 * @methodOf core.directives:alerts
			 * @param {Alert} alert an alert object
			 * @returns {void} returns void
			 * 
			 * @description
			 * 	A method utilizing 'AlertService' to remove the 'alert' object.
			 */
			$scope.remove = function(alert) {
				$timeout(function() {
					AlertService.remove(alert);
				}, duration);
			};
			
			/**
			 * @ngdoc function
			 * @name core.directives:alerts#alertIndex
			 * @methodOf core.directives:alerts
			 * @param {Alert} id an alert object
			 * @returns {void} returns void
			 * 
			 * @description
			 * 	A method to return 'alert' object based on the 'id' passed on to $scope.alerts object
			 */	
			var alertIndex = function(id) {
				for(var i in $scope.alerts) {
					if($scope.alerts[i].id == id) return i;
				}
			};

			/**
			 * @ngdoc function
			 * @name core.directives:alerts#handle
			 * @methodOf core.directives:alerts
			 * @param {Alert} id an alert object
			 * @returns {void} returns void
			 * 
			 * @description
			 * 	A method to remove 'alert' from a view.
			 */	
			var handle = function(alert) {
				if(alert.remove) {
					alert.fade = true;
					$timeout(function() {							
						$scope.alerts.splice(alertIndex(alert.id), 1);
					}, 350);
				}
				else {
					if(types.indexOf(alert.type) > -1) {
						$scope.alerts[$scope.alerts.length] = alert;					
						if(!fixed) {
							if(alert.type != "ERROR") {							
								$scope.remove(alert);
							}
						}
					}
				}
			};
			
			for(var i in facets) {
				if(channels.length > 0 && types.indexOf(facets[i]) > -1) continue;
				var alerts = AlertService.get(facets[i]);
				if(alerts.defer) {
					for(var i in alerts.list) {
						handle(alerts.list[i]);
					}
					alerts.defer.promise.then(function(alert){ 
							// resolved
						}, function(alert) { 
							// rejected
						}, function(alert) { 
							// notified
							handle(alert);
					});
				}
			}

			$rootScope.$on("$routeChangeStart", function(event, next, current) {				
    			// remove alerts on route change
    			for(var i in $scope.alerts) {
    				AlertService.remove($scope.alerts[i]);
    			}
			});
			
	    }
	};
});