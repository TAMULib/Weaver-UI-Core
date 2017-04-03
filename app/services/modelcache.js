core.service("ModelCache", function () {

    var ModalCache = this;

    var cache = {};

    ModalCache.set = function (key, value) {
        cache[key] = value;
    };

    ModalCache.get = function (key) {
        return cache[key];
    };

    ModalCache.remove = function (key) {
        delete cache[key];
    };

    return ModalCache;

});
