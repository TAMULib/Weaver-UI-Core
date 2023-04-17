core.service("ModalService", function ($timeout) {

    var ModalService = this;

    var bodyElement = angular.element('body');

    bodyElement.on('keydown', function (event) {
        if (modalElement && event.code === 'Tab') {
            $timeout(function () {
                if (!modalElement.has(angular.element(':focus')).length) {
                    modalElement.find(':input:first').focus();
                }
            });
        }
    });

    var modalElement;

    var handleKeydown = function (event) {
        if (event.code === 'Escape') {
            event.preventDefault();
            ModalService.closeModal();
        }
    };

    ModalService.openModal = function (id) {
        modalElement = angular.element(id);
        modalElement.modal('show');
        modalElement.on('shown.bs.modal', function (e) {
            modalElement.find(':input:not(:button):visible:enabled:not([readonly]):first, :input:first').focus();

            modalElement.on('keydown', handleKeydown);
        });
    };

    ModalService.closeModal = function () {
        if (modalElement) {
            modalElement.modal('hide');
            modalElement.off('keydown');
            modalElement.off('shown.bs.modal');
            modalElement = undefined;
        }
    };

    return ModalService;

});
