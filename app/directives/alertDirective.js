core.directive('alerts', function (AlertService, $timeout) {
	return {
		template: '<ul class="alertList list-unstyled"><li ng-if="culledAlerts.indexOf(alert.id) < 0" ng-repeat="alert in alerts" class="alertEntry"><span ng-include src="view"></span></li></ul>',
		restrict: 'E',
		replace: false,
		scope: {},
		link: function ($scope, element, attr) {

			var duration = attr.seconds ? parseInt(attr.seconds)*1000: 10000;
			var channel = attr.channel ? attr.channel: false;
			
			if(attr.only)
				var onlyTypes = attr.only.split(' ').join('').split(',');
			if(attr.no)
				var noTypes = attr.no.split(' ').join('').split(',');

			$scope.view = attr.customView ? attr.customView : "bower_components/core/app/views/alerts/defaultalert.html";

			$scope.alerts = AlertService.get('active');
			$scope.killTimers = {};
			$scope.culledAlerts = [];

			$scope.remove = function(alert) {
				alert.startFade = true;
				$timeout(function() {
					$scope.culledAlerts.push(alert.id)
				}, 310);
			}

			$scope.deactivate = function(id) {
				AlertService.deactivate(id);
			}	

			$scope.$watchCollection("alerts", function() {
				
				for(var index in $scope.alerts) {

					var alert = $scope.alerts[index];

					if(!attr.persist) {
						if(!$scope.killTimers[alert.id]) {
							$scope.killTimers[alert.id] = $timeout(function() {
								if($scope.culledAlerts.indexOf(alert.id) < 0){
									$scope.remove(alert);
								}
							}, duration);
						}
					}

					if(channel && channel != alert.channel) {
						if($scope.culledAlerts.indexOf(alert.id) < 0)
							$scope.culledAlerts.push(alert.id);
					}

				}	
			});
	    }
	};
});