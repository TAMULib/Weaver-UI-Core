core.directive("validatedtextarea", function() {
	return {
		template: '<span ng-include src="view"></span>',
		restrict: 'E',
		scope: {
			"model": "=",
			"property": "@",
			"label": "@",
			"rows": "@",
			"results": "="
		},
		link: function ($scope, element, attr) {
			$scope.view = attr.view ? attr.view : "bower_components/core/app/views/directives/validatedTextArea.html";
		}
	};
});