angular.module('core.version.version-directive', []).directive('coreVersion', ['version', function (version) {
    return function (scope, elm, attrs) {
        elm.text(version);
    };
}]);