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
    var modelName = delegateName.substring(0,delegateName.lastIndexOf("Repo"));
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
                function watch(property, key) {
                    property.watch(key, function (prop, old, val) {
                        model.instance.dirty(true);
                        return typeof val === 'function' ? val() : val;
                    });
                };

                for (var key in model.instance) {
                    if (model.instance.hasOwnProperty(key) && typeof model.instance[key] !== 'function') {

                        watch(model.instance, key);

                        var property = model.instance[key];

                        if (Array.isArray(property)) {
                            var isString = property.length > 0 ? typeof property[0] === 'string' : false;

                            for (var index in property) {
                                watch(property, index);
                            }

                            if (isString) {
                                property.push = function (element) {
                                    console.log(typeof element);
                                    var index = this.length;
                                    var array = Array.prototype.push.call(this, element);
                                    watch(this, index);
                                    return array;
                                }
                                property.unshift = function (element) {
                                    var array = Array.prototype.push.call(this, element);
                                    watch(this, 0);
                                    return array;
                                }
                            }

                        }

                    }
                }
            }, 250);

            return model.instance;
        }
    });
};
