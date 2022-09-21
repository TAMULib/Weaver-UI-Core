core.directive("validatedinput", function ($q, $timeout) {
    return {
        template: '<span ng-include src="view"></span>',
        restrict: 'E',
        scope: {
            "type": "@",
            "model": "=",
            "noId": "@",
            "id": "@",
            "property": "@",
            "label": "@",
            "disabled": "=",
            "placeholder": "@",
            "autocomplete": "@",
            "wvrTypeahead": "=",
            "typeaheadproperty": "@",
            "truevalue": "@",
            "falsevalue": "@",
            "hint": "@",
            "toolTip": "@",
            "form": "=",
            "confirm": "&",
            "validations": "=",
            "formView": "=",
            "results": "="
        },
        link: function ($scope, element, attr) {

            $scope.inProgress = false;

            if ($scope.formView) {
                $scope.view = 'node_modules/@wvr/core/app/views/directives/validatedInputForm.html';
            } else {
                $scope.view = 'node_modules/@wvr/core/app/views/directives/validatedInput.html';
            }

            if ($scope.form === undefined) {
                $scope.forms = {
                    dynamic: {}
                };
            }

            if ($scope.id === undefined && ($scope.noId === 'false' || $scope.noId === undefined)) {
                $scope.id = $scope.property;
            } else {
                $scope.id = Date.now();
            }

            var getForm = function () {
                return $scope.form !== undefined ? $scope.form : $scope.forms.dynamic;
            };

            var update = function () {
                if ($scope.confirm) {
                    $scope.inProgress = true;
                    $q.when($scope.confirm()).then(function () {
                        $timeout(function () {
                            $scope.inProgress = false;
                        }, 500);
                    });
                }
            };

            $scope.keydown = function ($event) {
                // enter(13): submit value to be persisted
                if ($event.which == 13 && $scope.formView && getForm().$valid) {
                    update();
                }
                // escape(27): reset value using shadow
                if ($event.which == 27) {
                    $scope.model.refresh();
                }
            };

            $scope.blur = function ($event) {
                if ($scope.formView && getForm().$valid) {
                    update();
                }
            };

            $scope.change = function ($event) {
                if (getForm().$valid) {
                    update();
                }
            };

        }
    };
});