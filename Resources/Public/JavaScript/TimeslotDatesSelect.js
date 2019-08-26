define(["require", "exports", "TYPO3/CMS/Backend/Modal", "jquery", "TYPO3/CMS/Backend/Icons", "jquery-ui/draggable", "jquery-ui/resizable"], function (require, exports, Modal, $, Icons) {
    "use strict";
    /**
    * Module: TYPO3/CMS/BwBookingmanager/TimeslotDatesSelect
     *
    * @exports TYPO3/CMS/BwBookingmanager/TimeslotDatesSelect
    */
    var TimeslotDatesSelect = /** @class */ (function () {
        function TimeslotDatesSelect() {
        }
        /**
         * @method init
         * @desc Initilizes the timeslot dates select button element
         * @private
         */
        TimeslotDatesSelect.prototype.init = function () {
            this.cacheDom();
            this.bindEvents();
            this.openFirstView();
        };
        TimeslotDatesSelect.prototype.bindEvents = function () {
            this.sidebarLinks.on('click', this.onSidebarLinkClick.bind(this));
            this.calendarDataLinks.on('click', this.onDataLinkClick.bind(this));
            this.dayDetailLinks.on('click', this.onDayDetailLinkClick.bind(this));
            this.dayDetailLinks.on('mouseenter', this.onDayDetailLinkMouseenter.bind(this));
            this.dayDetailLinks.on('mouseleave', this.onDayDetailLinkMouseleave.bind(this));
            this.modalReloadLinks.on('click', this.onReloadModalLinkClick.bind(this));
            if (this.savedLink)
                this.savedLink.on('click', this.onSavedLinkClick.bind(this));
        };
        TimeslotDatesSelect.prototype.openFirstView = function () {
            // check for any active sidebar link.
            // if there is none, no calendaruid is set in the current entry -> means, new entry. so guess the calendar
            if (this.sidebarLinks.find('.active').length)
                return;
            var calendarToOpen = this.currentCalendarViewUid ? this.currentCalendarViewUid : this.calendarSelectField.find('option:selected').val();
            if (!calendarToOpen)
                return;
            this.sidebarLinks.filter('[data-calendar-uid="' + calendarToOpen + '"]').trigger('click');
        };
        /**
         * Click on the blue button (preselected date)
         * @param {JQueryEventObject} e
         */
        TimeslotDatesSelect.prototype.onSavedLinkClick = function (e) {
            e.preventDefault();
            // reset day selection
            if (this.newDataLink) {
                this.newDataLink = null;
                this.calendarDataLinks.removeClass('active');
                $(e.currentTarget).removeClass('old');
            }
        };
        TimeslotDatesSelect.prototype.onDayDetailLinkMouseenter = function (e) {
            this.dayDetailDivs.removeClass('active');
            var link = $(e.currentTarget).data('day-detail');
            this.dayDetailDivs.filter('#' + link).addClass('active');
        };
        TimeslotDatesSelect.prototype.onDayDetailLinkMouseleave = function () {
            this.dayDetailDivs.removeClass('active');
            var selectedDiv = this.dayDetailDivs.filter('.daydetail--selected');
            var blueDiv = this.dayDetailDivs.filter('.daydetail--blue');
            if (selectedDiv.length) {
                $(selectedDiv).addClass('active');
            }
            else if (blueDiv.length) {
                $(blueDiv).addClass('active');
            }
        };
        TimeslotDatesSelect.prototype.onDayDetailLinkClick = function (e) {
            e.preventDefault();
            var daylink = $(e.currentTarget);
            var dayDetailDiv = this.dayDetailDivs.filter('#' + daylink.data('day-detail'));
            // reset if clicked again (click active data link again)
            if (daylink.hasClass('active')) {
                var activeDataLink = dayDetailDiv.find('.calendar-data-link.active');
                activeDataLink.trigger('click');
            }
            // new day -> click data link
            else {
                var firstDataLink = dayDetailDiv.find('.calendar-data-link').first();
                firstDataLink.trigger('click');
            }
        };
        TimeslotDatesSelect.prototype.onDataLinkClick = function (e) {
            e.preventDefault();
            var link = $(e.currentTarget);
            this.dayDetailDivs.removeClass('daydetail--selected');
            this.dayDetailLinks.removeClass('active');
            var daylink = this.dayDetailLinks.filter('[data-day-detail="' + link.data('day-link') + '"]');
            var dayDetailDiv = this.dayDetailDivs.filter('#' + link.data('day-link'));
            // abbort if clicked again
            if (link.hasClass('active')) {
                daylink.removeClass('active');
                this.newDataLink = null;
                this.calendarDataLinks.removeClass('active');
                this.calendarDataLinks.filter('.saved-active').addClass('active');
                this.onDayDetailLinkMouseleave();
                if (this.savedLink)
                    this.savedLink.removeClass('old');
            }
            // new data link gets selected
            else {
                daylink.addClass('active');
                dayDetailDiv.addClass('daydetail--selected');
                // @ts-ignore
                this.newDataLink = link;
                this.calendarDataLinks.removeClass('active');
                link.addClass('active');
                if (this.savedLink)
                    this.savedLink.addClass('old');
            }
        };
        TimeslotDatesSelect.prototype.onViewButtonClick = function (e) {
            e.preventDefault();
            this.calendarViews.toggleClass('active');
            $(e.currentTarget).toggleClass('active');
        };
        TimeslotDatesSelect.prototype.onSidebarLinkClick = function (e) {
            e.preventDefault();
            // switch sidebarlinks
            this.sidebarLinks.removeClass('active');
            e.currentTarget.classList.add('active');
            // switch tabs
            this.calendarTabs.removeClass('active');
            var tabId = e.currentTarget.getAttribute('href');
            this.calendarTabs.filter(tabId).addClass('active');
            // save uid for next reopen
            this.currentCalendarViewUid = $(e.currentTarget).data('calendar-uid');
        };
        TimeslotDatesSelect.prototype.cacheDom = function () {
            this.newDataLink = null;
            this.calendarTabs = this.currentModal.find('.calendar-tab');
            this.calendarViews = this.currentModal.find('.calendar-view');
            this.sidebarLinks = this.currentModal.find('a.list-group-item');
            this.calendarDataLinks = this.currentModal.find('.calendar-data-link');
            this.multipleTimeslotsLinks = this.currentModal.find('.multiple-timeslots-link');
            this.savedLink = this.currentModal.find('.bw_bookingmanager__day--isSelectedDay');
            this.dayDetailLinks = this.currentModal.find('[data-day-detail]');
            this.dayDetailDivs = this.currentModal.find('.daydetail');
            this.modalReloadLinks = this.currentModal.find('.modal-reload');
            if (!this.savedLink.length)
                this.savedLink = null;
        };
        TimeslotDatesSelect.prototype.show = function () {
            var wizardUri = this.trigger.data('wizard-uri');
            var modalTitle = this.trigger.data('modal-title');
            var modalSaveButtonText = this.trigger.data('modal-save-button-text');
            var modalViewButtonText = this.trigger.data('modal-view-button-text');
            var modalCancelButtonText = this.trigger.data('modal-cancel-button-text');
            this.calendarSelectField = $('select[name^="data[tx_bwbookingmanager_domain_model_entry]"][name$="[calendar]"]');
            this.hiddenStartDateField = $('input[name^="data[tx_bwbookingmanager_domain_model_entry]"][name$="[start_date]"]');
            this.hiddenEndDateField = $('input[name^="data[tx_bwbookingmanager_domain_model_entry]"][name$="[end_date]"]');
            this.hiddenTimeslotField = $('input[name^="data[tx_bwbookingmanager_domain_model_entry]"][name$="[timeslot]"]');
            this.startDateText = $('#savedStartDate');
            this.endDateText = $('#savedEndDate');
            this.currentModal = Modal.advanced({
                type: 'ajax',
                content: wizardUri,
                size: Modal.sizes.large,
                title: modalTitle,
                style: Modal.styles.light,
                ajaxCallback: this.init.bind(this),
                buttons: [
                    {
                        text: modalViewButtonText,
                        name: 'view',
                        icon: 'actions-system-list-open',
                        btnClass: 'btn-default btn-left',
                        trigger: this.onViewButtonClick.bind(this)
                    },
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
                        text: modalSaveButtonText,
                        name: 'save',
                        icon: 'actions-document-save',
                        active: true,
                        btnClass: 'btn-primary',
                        dataAttributes: {
                            action: 'save'
                        },
                        trigger: this.save.bind(this)
                    }
                ]
            });
        };
        TimeslotDatesSelect.prototype.save = function () {
            if (this.newDataLink) {
                this.calendarSelectField.val(this.newDataLink.data('calendar'));
                this.hiddenStartDateField.val(this.newDataLink.data('start-date'));
                this.hiddenEndDateField.val(this.newDataLink.data('end-date'));
                this.hiddenTimeslotField.val(this.newDataLink.data('timeslot'));
                this.startDateText.html(this.newDataLink.data('start-date-text'));
                this.endDateText.html(this.newDataLink.data('end-date-text'));
            }
            Modal.currentModal.trigger('modal-dismiss');
        };
        TimeslotDatesSelect.prototype.onReloadModalLinkClick = function (e) {
            var _this = this;
            e.preventDefault();
            var reloadLink = $(e.currentTarget).attr('href');
            var contentTarget = '.t3js-modal-body';
            var $loaderTarget = this.currentModal.find(contentTarget);
            Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).done(function (icon) {
                $loaderTarget.html('<div class="modal-loading">' + icon + '</div>');
                $.get(reloadLink, function (response) {
                    _this.currentModal.find(contentTarget)
                        .empty()
                        .append(response);
                    _this.init();
                    _this.currentModal.trigger('modal-loaded');
                }, 'html');
            });
        };
        TimeslotDatesSelect.prototype.initializeTrigger = function () {
            var _this = this;
            var triggerHandler = function (e) {
                e.preventDefault();
                // @ts-ignore
                _this.trigger = $(e.currentTarget);
                _this.show();
            };
            // @ts-ignore
            $('.t3js-timeslotdatesselect-trigger').off('click').click(triggerHandler);
        };
        return TimeslotDatesSelect;
    }());
    return new TimeslotDatesSelect();
});
