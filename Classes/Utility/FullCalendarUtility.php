<?php

namespace Blueways\BwBookingmanager\Utility;

use Blueways\BwBookingmanager\Domain\Model\Dto\BackendCalendarViewState;
use Blueways\BwBookingmanager\Domain\Model\Dto\CalendarEvent;
use Blueways\BwBookingmanager\Domain\Model\Dto\EntryCalendarEvent;
use Blueways\BwBookingmanager\Domain\Repository\BlockslotRepository;
use Blueways\BwBookingmanager\Domain\Repository\CalendarRepository;
use Blueways\BwBookingmanager\Domain\Repository\EntryRepository;
use Blueways\BwBookingmanager\Domain\Repository\HolidayRepository;
use Blueways\BwBookingmanager\Domain\Repository\TimeslotRepository;
use TYPO3\CMS\Backend\Routing\UriBuilder;

class FullCalendarUtility
{
    protected UriBuilder $uriBuilder;

    protected CalendarRepository $calendarRepository;

    protected TimeslotRepository $timeslotRepository;

    protected BlockslotRepository $blockslotRepository;

    protected HolidayRepository $holidayRepository;

    protected EntryRepository $entryRepository;

    /**
     * @param \TYPO3\CMS\Backend\Routing\UriBuilder $uriBuilder
     * @param \Blueways\BwBookingmanager\Domain\Repository\CalendarRepository $calendarRepository
     * @param \Blueways\BwBookingmanager\Domain\Repository\TimeslotRepository $timeslotRepository
     * @param \Blueways\BwBookingmanager\Domain\Repository\BlockslotRepository $blockslotRepository
     * @param \Blueways\BwBookingmanager\Domain\Repository\HolidayRepository $holidayRepository
     * @param \Blueways\BwBookingmanager\Domain\Repository\EntryRepository $entryRepository
     */
    public function __construct(
        UriBuilder $uriBuilder,
        CalendarRepository $calendarRepository,
        TimeslotRepository $timeslotRepository,
        BlockslotRepository $blockslotRepository,
        HolidayRepository $holidayRepository,
        EntryRepository $entryRepository
    ) {
        $this->uriBuilder = $uriBuilder;
        $this->calendarRepository = $calendarRepository;
        $this->timeslotRepository = $timeslotRepository;
        $this->blockslotRepository = $blockslotRepository;
        $this->holidayRepository = $holidayRepository;
        $this->entryRepository = $entryRepository;
    }

    public function getEvents(BackendCalendarViewState $viewState): array
    {
        $startDate = $viewState->getStartDate();
        $endDate = $viewState->getEndDate();
        $entryUid = $viewState->entryUid;

        $calendars = $this->calendarRepository->findAllByPid($viewState->pid);

        if (!$calendars && !$calendars->count()) {
            return [];
        }

        $timeslotEvents = $this->timeslotRepository->getCalendarEventsInCalendar($calendars, $startDate, $endDate);
        $blockslotEvents = $this->blockslotRepository->getCalendarEventsInCalendar($calendars, $startDate, $endDate);
        $holidayEvents = $this->holidayRepository->getCalendarEventsInCalendar($calendars, $startDate, $endDate);
        $entryEvents = $this->entryRepository->getCalendarEventsInCalendar($calendars, $startDate, $endDate);
        $virtualEvents = $this->getVirtualEvents($entryEvents, $viewState);

        $events = array_merge([], $timeslotEvents, $blockslotEvents, $holidayEvents, $entryEvents, $virtualEvents);

        if ($entryUid) {
            return $this->getOutputForBackendModal($events, $viewState);
        }
        return $this->getOutputForBackendModule($events);
    }

    private function getVirtualEvents(
        array $entryEvents,
        BackendCalendarViewState $viewState
    ): array {
        $entryUid = $viewState->entryUid;

        if (!$entryUid || !$viewState->getEntryStartDate() || !$viewState->getEntryEndDate()) {
            return [];
        }

        // NEW023820 => create new (virtual) EntryEvent
        if ($viewState->isNewModalView()) {
            $event = new EntryCalendarEvent();
            $event->setStart($viewState->getEntryStartDate());
            $event->setEnd($viewState->getEntryEndDate());
            $event->setUid($entryUid);
            $event->setCalendar($viewState->calendar);
            $event->setTimeslot($viewState->timeslot);
            return [$event];
        }
        // check if saved entry already in result
        $savedEntry = array_filter($entryEvents, static function ($event) use ($entryUid) {
            return $event->uid === (int)$entryUid;
        });
        // query entry, convert to event and add to result
        if (!count($savedEntry)) {
            $entry = $this->entryRepository->findByUid((int)$entryUid);
            if ($entry) {
                $event = EntryCalendarEvent::createFromEntity($entry);
                return [$event];
            }
        }

        return [];
    }

    private function getOutputForBackendModal(array $events, $viewState): array
    {
        $fullCalendarEvents = [];

        /** @var CalendarEvent $event */
        foreach ($events as $event) {
            $event->addBackendModalSettings($this->uriBuilder, $viewState);
            $fullCalendarEvents[] = $event->getFullCalendarOutput();
        }

        return $fullCalendarEvents;
    }

    /**
     * @param CalendarEvent[] $events
     * @return array
     */
    private function getOutputForBackendModule(array $events): array
    {
        $fullCalendarEvents = [];

        foreach ($events as $event) {
            $event->addBackendEditActionLink($this->uriBuilder);
            $event->addBackendModuleToolTip();
            $fullCalendarEvents[] = $event->getFullCalendarOutput();
        }

        return $fullCalendarEvents;
    }
}
