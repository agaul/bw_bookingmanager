define(["require", "exports", "TYPO3/CMS/Backend/Modal", "jquery", "TYPO3/CMS/Backend/Icons"], function (require, exports, Modal, $, Icons) {
    "use strict";
    /**
     * Module: TYPO3/CMS/BwBookingmanager/SendMailWizard
     *
     * @exports TYPO3/CMS/BwBookingmanager/SendMailWizard
     */
    var SendMailWizard = /** @class */ (function () {
        function SendMailWizard() {
        }
        SendMailWizard.prototype.init = function () {
            this.cacheElements();
            this.initEvents();
        };
        SendMailWizard.prototype.cacheElements = function () {
            this.$sendMailButton = $('#sendMailButton');
        };
        SendMailWizard.prototype.initEvents = function () {
            this.$sendMailButton.on('click', this.onButtonClick.bind(this));
        };
        SendMailWizard.prototype.onButtonClick = function (e) {
            e.preventDefault();
            // collect modal infos
            var wizardUri = this.$sendMailButton.data('wizard-uri');
            var modalTitle = this.$sendMailButton.data('modal-title');
            var modalCancelButtonText = this.$sendMailButton.data('modal-cancel-button-text');
            var modalSendButtonText = this.$sendMailButton.data('modal-send-button-text');
            this.currentModal = Modal.advanced({
                type: 'ajax',
                content: wizardUri,
                size: Modal.sizes.large,
                title: modalTitle,
                style: Modal.styles.light,
                ajaxCallback: this.onModalOpened.bind(this),
                buttons: [
                    {
                        text: modalCancelButtonText,
                        name: 'dismiss',
                        icon: 'actions-close',
                        btnClass: 'btn-default',
                        dataAttributes: {
                            action: 'dismiss'
                        },
                        trigger: function () {
                            Modal.currentModal.trigger('modal-dismiss');
                        }
                    },
                    {
                        text: modalSendButtonText,
                        name: 'save',
                        icon: 'actions-document-save',
                        active: true,
                        btnClass: 'btn-primary',
                        dataAttributes: {
                            action: 'save'
                        },
                        trigger: this.send.bind(this)
                    }
                ]
            });
        };
        SendMailWizard.prototype.onModalOpened = function () {
            var templateSelector = this.currentModal.find('select#emailTemplate');
            var previewUri = templateSelector.find('option:selected').data('preview-uri');
            // onload first template
            this.loadEmailPreview(previewUri);
            // bind events
            templateSelector.on('change', function (el) {
                var previewUri = $(el.currentTarget).find('option:selected').data('preview-uri');
                this.loadEmailPreview(previewUri);
            }.bind(this));
        };
        SendMailWizard.prototype.loadEmailPreview = function (uri) {
            var _this = this;
            var $loaderTarget = this.currentModal.find('#emailPreview');
            Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).done(function (icon) {
                $loaderTarget.html(icon);
                $.get(uri, _this.showEmailPreview.bind(_this), 'json');
            });
        };
        SendMailWizard.prototype.showEmailPreview = function (data) {
            var $loaderTarget = this.currentModal.find('#emailPreview');
            $loaderTarget.html('<iframe frameborder="0" style="width:100%; min-height:calc(100vh - 400px); margin-bottom: -5px;" src="' + data.src + '"></iframe>');
        };
        SendMailWizard.prototype.send = function (e) {
        };
        return SendMailWizard;
    }());
    return new SendMailWizard().init();
});
