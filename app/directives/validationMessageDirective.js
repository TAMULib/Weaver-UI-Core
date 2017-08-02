core.directive("validationmessage", function () {
    return {
        template: '<span ng-include src="view"></span>',
        restrict: 'E',
        scope: {
            "type": "@",
            "property": "@",
            "form": "=",
            "validations": "=",
            "results": "="
        },
        link: function ($scope, element, attr) {
            $scope.view = attr.view ? attr.view : "node_modules/weaver-ui-core/app/views/directives/validationMessage.html";
        }
    };
});
