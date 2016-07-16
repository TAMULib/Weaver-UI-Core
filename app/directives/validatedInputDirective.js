core.directive("validatedinput", function() {
	return {
		template: '<span ng-include src="view"></span>',
		restrict: 'E',
		scope: {
			"type": "@",
			"model": "=",
			"property": "@",
			"label": "@",
			"textField": "=",
			"placeholder": "@",
			"truevalue": "@",
			"falsevalue": "@",			
			"blurEnabled": "=",
			"hint": "@",
			"form": "=",
			"confirm": "&",
			"validations": "=",
			"results": "="
		},
		link: function ($scope, element, attr) {
			$scope.view = attr.view ? attr.view : "bower_components/core/app/views/directives/validatedInput.html";

			$scope.keydown = function($event) {
				// enter(13): submit value to be persisted
				if($event.which == 13 && $scope.blurEnabled && $scope.form.$valid) {
					$scope.confirm();
				}
				// escape(27): reset value using shadow
				if($event.which == 27) {
					$scope.model.refresh();
				}
			};

			$scope.blur = function($event) {
				if($scope.blurEnabled && $scope.form.$valid) {
					if($scope.confirm !== undefined) {
						$scope.confirm();
					}
				}
			};

		}
	};
});