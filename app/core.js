/**
 * 
 * @ngdoc object
 * @name core
 * @description 
 * 
 *  This is the main module for the TAMU-UI-Core framework.
 *  The TAMU UI Core is an Angular Module intended to be imported into
 *  any UI build to work with the TAMU Webservice Core.
 *
**/

var core = angular.module('core', 
[
	'core.version'
]).constant('coreConfig', coreConfig);

