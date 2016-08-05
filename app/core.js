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

core.repo = function(delegateName, delegateFunction) {
	var modelName = delegateName.replace('Repo', '');
	return core.factory(delegateName, function ($injector, AbstractRepo, AbstractAppRepo, api) {
				
		var $inject = $injector.annotate(delegateFunction);

		for(var i in $inject) {
			var injection = $inject[i]; 
			if(injection.indexOf("_MODEL_") != -1) {
				modelName = injection.replace("_MODEL_", "");
				$inject.splice(injection);
				break;
			}
		}

  		delegateFunction.$inject = $inject;

  		var abstractRepo = new AbstractRepo($injector.get(modelName), api[modelName]);

		var abstractAppRepo = new AbstractAppRepo();

		angular.extend(abstractAppRepo, abstractRepo);

		angular.extend(delegateFunction.prototype, abstractAppRepo);

		var repoInstance = $injector.invoke(delegateFunction, delegateFunction.prototype);

		angular.extend(abstractAppRepo, repoInstance);

		angular.extend(abstractRepo, abstractAppRepo);

		return repoInstance;
	});
      	
};

core.model = function(delegateName, delegateFunction) {
	return core.factory(delegateName, function ($injector, AbstractModel, AbstractAppModel, api) {
		return function(data) {

			delegateFunction.$inject = $injector.annotate(delegateFunction);

			var model = $injector.invoke(delegateFunction, delegateFunction.prototype);

			var abstractModel = new AbstractModel();
			
			var abstractAppModel = new AbstractAppModel();

			angular.extend(abstractAppModel, abstractModel);

			angular.extend(model.prototype, abstractAppModel);

			var modelInstance = new model();

			modelInstance.init(data, api[delegateName]);

			angular.extend(abstractAppModel, modelInstance);

			angular.extend(abstractModel, abstractAppModel);

			return modelInstance;
		};
	});
};