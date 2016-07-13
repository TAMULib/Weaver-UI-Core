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
			"results": "="
		},
		link: function ($scope, element, attr) {
			$scope.view = attr.view ? attr.view : "bower_components/core/app/views/directives/validatedSelect.html";
		}
	};
});