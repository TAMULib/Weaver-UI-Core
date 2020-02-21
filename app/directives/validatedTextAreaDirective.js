core.directive("validatedtextarea", function () {
    return {
        template: '<span ng-include src="view"></span>',
        restrict: 'E',
        scope: {
            "model": "=",
            "noId": "@",
            "id": "@",
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

            if ($scope.id === undefined && ($scope.noId === 'false' || $scope.noId === undefined)) {
                $scope.id = $scope.property;
            }

            $scope.view = attr.view ? attr.view : "node_modules/@wvr/core/app/views/directives/validatedTextArea.html";

            $scope.blur = function ($event) {
                if ($scope.blurEnabled && $scope.form.$valid) {
                    if ($scope.confirm !== undefined) {
                        $scope.confirm();
                    }
                }
            };
        }
    };
});
