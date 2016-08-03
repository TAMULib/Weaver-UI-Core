core.directive("validatedselect", function() {
	return {
		template: '<span ng-include src="view"></span>',
		restrict: 'E',
		scope: {
			"options": "=",
			"optionproperty": "@",
			"model": "=",
			"property": "@",
			"label": "@",
			"blurEnabled": "=",
			"form": "=",
			"confirm": "&",
			"change": "&",
			"validations": "=",
			"results": "="
		},
		link: function ($scope, element, attr) {
			$scope.view = attr.view ? attr.view : "bower_components/core/app/views/directives/validatedSelect.html";
			
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