core.directive('alerts', function (AlertService, $controller, $rootScope, $timeout) {
	return {
		template: '<ul ng-if="alerts.length > 0" class="alertList list-unstyled"><li ng-repeat="alert in alerts" class="alertEntry"><span ng-include src="view"></span></li></ul>',
		restrict: 'E',
		replace: false,
		scope: {},
		link: function ($scope, element, attr) {

			angular.extend(this, $controller('AbstractController', {$scope: $scope}));

			var fixed = typeof attr.fixed != 'undefined';
						
			var exclusive = typeof attr.exclusive != 'undefined';
			
			var duration = typeof attr.seconds != 'undefined' ? parseInt(attr.seconds) * 1000: coreConfig.alerts.duration;
			
			var types = [];
			
			if(typeof attr.types != 'undefined') {
				var splitTypes = attr.types.split(',');
				for(var i in splitTypes) {
					types.push(splitTypes[i].trim());
				}
			}

			if(types.length == 0) {
				types.push("ERROR");
			}
			
			var channels = [];
			
			if(typeof attr.channels != 'undefined') {
				var splitChannels = attr.channels.split(',');
				for(var i in splitChannels) {
					var channel = splitChannels[i].trim();
					channels.push(channel);
					AlertService.create(channel, exclusive);
				}
			}
			
			var facets = [];
			
			facets = facets.concat(types ? types : []);
			facets = facets.concat(channels ? channels : []);
			
			var timers = {};
			
			$scope.view = attr.view ? attr.view : "bower_components/core/app/views/alerts/defaultalert.html";
			
			$scope.alerts = [];

			$scope.remove = function(alert) {
				$timeout(function() {
					AlertService.remove(alert);
				}, duration);
			};
			
			var alertIndex = function(id) {
				for(var i in $scope.alerts) {
					if($scope.alerts[i].id == id) return i;
				}
			};

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
				
				for(var j in alerts.list) {
					handle(alerts.list[j]);
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

			$rootScope.$on("$routeChangeStart", function(event, next, current) {				
    			// remove alerts on route change
    			for(var i in $scope.alerts) {
    				AlertService.remove($scope.alerts[i]);
    			}
			});
			
	    }
	};
});
