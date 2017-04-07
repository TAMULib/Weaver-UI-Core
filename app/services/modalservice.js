core.service("ModalService", function () {

    var ModalService = this;

    ModalService.openModalId;

    ModalService.openModal = function (id) {
        ModalService.openModalId = id;
        angular.element(id).modal('show');
    };

    ModalService.closeModal = function () {
        angular.element(ModalService.openModalId).modal('hide');
    };

    return ModalService;

});
