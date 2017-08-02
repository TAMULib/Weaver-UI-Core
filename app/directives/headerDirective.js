/**
 * @ngdoc directive
 * @name  core.directive:tamuheader
 * @restrict 'E'
 * @requires $controller
 *
 * @example
 * <pre>
 * 	<tamuheader title="PROJECT TITLE"></tamuheader>
 * </pre>
 *
 * @description
 * The tamuheader element directive is used to provide TAMU specific header information from header.html file.
 *
 */
core.directive('tamuheader', function ($controller) {
    return {
        templateUrl: 'node_modules/weaver-ui-core/app/views/header.html',
        restrict: 'E',
        replace: false,
        transclude: true,
        link: function ($scope, element, attr) {

            /**
             * @ngdoc property
             * @name core.directive:tamuheader#$scope.attr
             * @propertyOf core.directive:tamuheader
             *
             * @description
             * 	A $scope variable 'title' to store the 'title' property of the 'attr' object
             */
            $scope.title = attr.title;
        }
    };
});
