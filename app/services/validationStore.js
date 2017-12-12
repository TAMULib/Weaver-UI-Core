core.service("ValidationStore", function (WsApi) {

    var ValidationStore = this;

    ValidationStore.validations = {};

    ValidationStore.getValidations = function (entityName) {
        if (ValidationStore.validations[entityName] === undefined) {
            ValidationStore.validations[entityName] = {};
            WsApi.fetch({
                'endpoint': '/private/queue',
                'controller': 'validations',
                'method': entityName
            }).then(function (res) {
                var resObj = angular.fromJson(res.body);
                if (resObj.meta.status === 'SUCCESS') {
                    angular.extend(ValidationStore.validations[entityName], resObj.payload.HashMap);
                } else {
                    console.info(entityName + ' is not a server side entity');
                }
            });
        }
        return ValidationStore.validations[entityName];

    };

    return ValidationStore;

});
