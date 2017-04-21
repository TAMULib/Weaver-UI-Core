core.service("SubscriptionService", function () {

    var SubscriptionService = this;

    var subscriptions = {};

    SubscriptionService.set = function (key, value) {
        subscriptions[key] = value;
    };

    SubscriptionService.get = function (key) {
        return subscriptions[key];
    };

    SubscriptionService.remove = function (key) {
        delete subscriptions[key];
    };

    SubscriptionService.clear = function () {
        for (var key in subscriptions) {
            delete subscriptions[key];
        }
    };

    return SubscriptionService;

});
