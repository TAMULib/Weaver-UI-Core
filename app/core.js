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
var core = angular.module('core', [
    'core.version',
    'ngRoute',
    'ngSanitize',
    'ngFileUpload'
]).constant('coreConfig', coreConfig);

core.repo = function (delegateName, delegateFunction) {
    var modelName = delegateName.replace('Repo', '');
    return core.factory(delegateName, function ($injector, AbstractRepo, AbstractAppRepo, api) {

        delegateFunction.$inject = $injector.annotate(delegateFunction);

        var abstractRepo = new AbstractRepo(modelName, $injector.get(modelName), api[modelName]);

        var abstractAppRepo = new AbstractAppRepo();

        angular.extend(abstractAppRepo, abstractRepo);

        angular.extend(delegateFunction.prototype, abstractAppRepo);

        var repoInstance = $injector.invoke(delegateFunction, delegateFunction.prototype);

        angular.extend(abstractAppRepo, repoInstance);

        angular.extend(abstractRepo, abstractAppRepo);

        return repoInstance;
    });

};

core.model = function (delegateName, delegateFunction) {
    var repoName = delegateName + 'Repo';
    return core.factory(delegateName, function ($injector, $rootScope, $timeout, AbstractModel, AbstractAppModel, api) {

        var ctor = function (data) {

            delegateFunction.$inject = $injector.annotate(delegateFunction);

            var model = $injector.invoke(delegateFunction, delegateFunction.prototype);

            var abstractModel = new AbstractModel(repoName);

            var abstractAppModel = new AbstractAppModel();

            angular.extend(abstractAppModel, abstractModel);

            angular.extend(model.prototype, abstractAppModel);

            this.instance = new model();

            this.instance.init(data, api[delegateName]);

            angular.extend(abstractAppModel, this.instance);

            angular.extend(abstractModel, abstractAppModel);

            return this;
        };

        return function (data) {
            var model = new ctor(data);
            $timeout(function () {
                $rootScope.$watch(function () {
                    return model.instance;
                }, function (newVal, oldVal) {
                    model.instance.dirty(true);
                    console.log('change')
                }, true);
            }, 250);
            return model.instance;
        }
    });
};
