core.directive("validatedinput", function() {
	return {
		template: '<span ng-include src="view"></span>',
		restrict: 'E',
		scope: {
			"type": "@",
			"model": "=",
			"property": "@",
			"label": "@",
			"placeholder": "@",
			"results": "="
		},
		link: function ($scope, element, attr) {
			$scope.view = attr.view ? attr.view : "bower_components/core/app/views/directives/validatedInput.html";
		}
	};
});