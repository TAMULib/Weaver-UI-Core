core.service("ModalService", function () {

    var ModalService = this;

    var body = document.querySelector('body');

    var modalElement;

    var closeOnEscape = function(event) {
        if (modalElement && event.code === 'Escape') {
            ModalService.closeModal();
            event.preventDefault();
        }
    };

    ModalService.openModal = function (id) {
        modalElement = angular.element(id);
        modalElement.modal('show');
        modalElement.on('shown.bs.modal', function (e) {
            modalElement.find(":input:not(:button):visible:enabled:not([readonly]):first").focus();
        });
        if (modalElement.data('keyboard')) {
            body.addEventListener('keydown', closeOnEscape);
        }
    };

    ModalService.closeModal = function () {
        if (modalElement) {
            modalElement.modal('hide');
            if (modalElement.data('keyboard')) {
                body.removeEventListener('keydown', closeOnEscape);
            }
        }
    };

    return ModalService;

});
