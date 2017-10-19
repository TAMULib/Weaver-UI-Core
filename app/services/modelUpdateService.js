core.service("ModelUpdateService", function ($q) {

    var ModelUpdateService = this;

    var modelRegistry = {

    };

    var updateCallbackRegistry = {

    };

    var getKey = function (model) {
        var key = model.constructor.name;
        if (model.id) {
            key += '-' + model.id;
        }
        return key;
    };

    var getModelRegistry = function (model) {
        var registry = modelRegistry[getKey(model)];
        if (!registry) {
            registry = modelRegistry[getKey(model)] = [model];
        }
        return registry;
    };

    var getCallbacks = function (model) {
        var callbacks = updateCallbackRegistry[getKey(model)];
        if (!callbacks) {
            callbacks = updateCallbackRegistry[getKey(model)] = [];
        }
        return callbacks;
    };

    ModelUpdateService.register = function (model) {
        var registry = getModelRegistry(model);
        registry.push(model);
    };

    ModelUpdateService.add = function (model, callback) {
        var callbacks = getCallbacks(model);
        callbacks.push(callback);
    };

    ModelUpdateService.update = function (model, data) {
        var registry = getModelRegistry(model);
        var callbacks = getCallbacks(model);
        for (var i in registry) {
            for (var j in callbacks) {
                callbacks[j](registry[i], data);
            }
        }
    };

    ModelUpdateService.clear = function () {
        for (var i in modelRegistry) {
            delete modelRegistry[j];
        }
        for (var j in updateCallbackRegistry) {
            delete updateCallbackRegistry[j];
        }
    };

    return ModelUpdateService;

});
