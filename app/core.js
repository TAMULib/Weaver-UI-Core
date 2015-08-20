var core = angular.module('core', 
[
	'core.version'
]).constant('coreConfig', coreConfig);

setUpApp(function() {
	angular.bootstrap(document, ['core']);
});