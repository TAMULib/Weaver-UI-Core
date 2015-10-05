core.directive('alerts', function (AlertService, $rootScope, $timeout) {
	return {
		template: '<ul class="alertList list-unstyled"><li ng-repeat="alert in alerts" class="alertEntry"><span ng-include src="view"></span></li></ul>',
		restrict: 'E',
		replace: false,
		scope: {},
		link: function ($scope, element, attr) {
		
			var fixed = Object.keys(attr).indexOf('fixed') > -1;
			
			var duration = attr.seconds ? parseInt(attr.seconds) * 1000: coreConfig.alerts.duration;
			
			var types = [];
			var channels = [];

			if(attr.types) {
				var splitTypes = attr.types.split(',');
				for(var i in splitTypes) {
					types.push(splitTypes[i].trim());
				}
			}
			
			if(attr.channels) {
				var splitChannels = attr.channels.split(',');
				for(var i in splitChannels) {
					channels.push(splitChannels[i].trim());
				}
			}
			
			var facets = [];
			
			facets = facets.concat(types ? types : []);
			facets = facets.concat(channels ? channels : []);

			var timers = {};
			
			$scope.view = attr.view ? attr.view : "bower_components/core/app/views/alerts/defaultalert.html";
			
			$scope.alerts = {};
			
			$scope.remove = function(alert) {
				if(!timers[alert.id]) {
					timers[alert.id] = $timeout(function() {
						AlertService.remove(alert);
					}, duration);
				}
			};
			
			var handle = function(alert) {
				if(alert.remove) {
					alert.fade = true;
					$timeout(function() {
						delete $scope.alerts[alert.id];
					}, 250);
				}
				else {
					if(types.indexOf(alert.type) > -1) {
						$scope.alerts[alert.id] = alert;
					}

					if(!fixed) {
						if(alert.type != "ERROR") {
							$scope.remove(alert);
						}
					}
				}
			};
			
			var ignoreTypes = false;

			for(var i in facets) {

				if(channels.length > 0) ignoreTypes = true;
				
				if(ignoreTypes && types.indexOf(facets[i]) > -1) continue;

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

			$rootScope.$on("$routeChangeStart",function(event, next, current){
    			//cancel timers on route change
    			for(var i in timers) {
    				$timeout.cancel(timers[i]);
    			}
    			// clean up alerts on route change
    			for(var id in $scope.alerts) {
    				//AlertService.remove($scope.alerts[id]);
    				$scope.alerts[id].fade = true;
    				delete $scope.alerts[id];
    			}
			});
			
	    }
	};
});