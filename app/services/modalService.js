core.service("ModalService", function () {

    var ModalService = this;

    ModalService.openModalId = undefined;

    ModalService.openModal = function (id) {
        ModalService.openModalId = id;
        angular.element(id).modal('show');
    };

    ModalService.closeModal = function () {
        angular.element(ModalService.openModalId).modal('hide');
        angular.element('body').removeClass('modal-open');
        angular.element('.modal-backdrop').remove();
    };

    return ModalService;

});