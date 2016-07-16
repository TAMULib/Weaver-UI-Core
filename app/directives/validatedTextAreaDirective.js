core.directive("validatedtextarea", function() {
	return {
		template: '<span ng-include src="view"></span>',
		restrict: 'E',
		scope: {
			"model": "=",
			"property": "@",
			"label": "@",
			"rows": "@",
			"blurEnabled": "=",
			"form": "=",
			"confirm": "&",
			"validations": "=",
			"results": "="
		},
		link: function ($scope, element, attr) {
			$scope.view = attr.view ? attr.view : "bower_components/core/app/views/directives/validatedTextArea.html";
			
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