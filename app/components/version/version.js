angular.module('core.version', [
    'core.version.interpolate-filter',
    'core.version.version-directive'
]).value('version', coreConfig.version);