core.service("ModalService", function () {

    var ModalService = this;

    var modalElement;

    ModalService.openModal = function (id) {
        modalElement = angular.element(id);
        modalElement.modal('show');
    };

    ModalService.closeModal = function () {
        if (modalElement) {
            modalElement.modal('hide');
        }
    };

    return ModalService;

});