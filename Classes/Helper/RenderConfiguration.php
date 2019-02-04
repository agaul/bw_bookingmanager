<?php

namespace Blueways\BwBookingmanager\Helper;

/**
 * This file is part of the "Booking Manager" Extension for TYPO3 CMS.
 * PHP version 7.2
 *
 * @package  BwBookingManager
 * @author   Maik Schneider <m.schneider@blueways.de>
 * @license  MIT https://opensource.org/licenses/MIT
 * @version  GIT: <git_id />
 * @link     http://www.blueways.de
 */
class RenderConfiguration
{

    /**
     * @var \Blueways\BwBookingmanager\Domain\Model\Timeslot[]
     */
    protected $timeslots;

    /**
     * @var \Blueways\BwBookingmanager\Domain\Model\Entry[]
     */
    protected $entries;

    /**
     * @var \Blueways\BwBookingmanager\Domain\Model\Dto\DateConf
     */
    protected $dateConf;

    /**
     * @var \Blueways\BwBookingmanager\Domain\Model\Calendar
     */
    protected $calendar;

    /**
     * RenderConfiguration constructor.
     *
     * @param \Blueways\BwBookingmanager\Domain\Model\Dto\DateConf $dateConf
     * @param \Blueways\BwBookingmanager\Domain\Model\Calendar $calendar
     */
    public function __construct($dateConf, $calendar)
    {
        $this->dateConf = $dateConf;
        $this->calendar = $calendar;
    }

    /**
     * @param $entries
     */
    public function setEntries($entries)
    {
        $this->entries = $entries;
    }

    /**
     * @param $timeslots
     */
    public function setTimeslots($timeslots)
    {
        $this->timeslots = $timeslots;
    }

    /**
     * @return array
     * @throws \Exception
     */
    public function getRenderConfiguration()
    {
        $start = $this->dateConf->start;
        $daysCount = $this->dateConf->start->diff($this->dateConf->end)->days;
        $numberOfWeeks = \Blueways\BwBookingmanager\Helper\TimeslotManager::dayCount($this->dateConf->start,
            $this->dateConf->end, 1);

        return array(
            'days' => $this->getDaysArray($start, $daysCount),
            'weeks' => $this->getWeeksArray($start, $numberOfWeeks),
            'next' => [
                'date' => $this->dateConf->next,
                'day' => $this->dateConf->next->format('j'),
                'month' => $this->dateConf->next->format('m'),
                'year' => $this->dateConf->next->format('Y'),
            ],
            'prev' => [
                'date' => $this->dateConf->prev,
                'day' => $this->dateConf->prev->format('j'),
                'month' => $this->dateConf->prev->format('m'),
                'year' => $this->dateConf->prev->format('Y'),
            ],
        );
    }

    private function getDaysArray($startDate, $daysCount)
    {
        $days = [];
        $startDate = clone $startDate;

        for ($i = 0; $i <= $daysCount; $i++) {
            $days[$i] = [
                'date' => clone $startDate,
                'timeslots' => $this->getTimeslotsForDay($startDate),
                'entries' => $this->getEntriesForDay($startDate),
                'isCurrentDay' => $this->isCurrentDay($startDate),
                'isNotInMonth' => !($startDate->format('m') == $this->dateConf->start->format('m')),
                'isInPast' => $this->isInPast($startDate)
            ];
            $days[$i]['isBookable'] = $this->getDayIsBookable($days[$i]['timeslots']);
            $days[$i]['isDirectBookable'] = $this->isDirectBookable($days[$i]['entries']);

            $startDate->modify('+1 day');
        }
        return $days;
    }

    /**
     * @param \DateTime $day
     * @return array
     */
    private function getTimeslotsForDay($day)
    {
        $timeslots = [];

        if (!$this->timeslots) {
            return $timeslots;
        }

        $dayEnd = clone $day;
        $dayEnd->setTime(23, 59, 59);

        foreach ($this->timeslots as $timeslot) {
            if (!($timeslot->getEndDate() < $day || $timeslot->getStartDate() > $dayEnd)) {
                $timeslots[] = $timeslot;
            }
        }
        return $timeslots;
    }

    private function getEntriesForDay(\DateTime $day)
    {
        $entries = [];

        if (!$this->entries) {
            return $entries;
        }

        $dayEnd = clone $day;
        $dayEnd->setTime(23, 59, 59);

        foreach ($this->entries as $entry) {
            if (!($entry->getEndDate() < $day || $entry->getStartDate() > $dayEnd)) {
                $entries[] = $entry;
            }
        }
        return $entries;
    }

    /**
     * @param \DateTime $day
     * @return bool
     * @throws \Exception
     */
    private function isCurrentDay($day)
    {
        $now = new \DateTime('now');
        return $now->format('d.m.Y') === $day->format('d.m.Y');
    }

    /**
     * @param \DateTime $day
     * @return bool
     * @throws \Exception
     */
    private function isInPast($day)
    {
        $now = new \DateTime('now');
        return $day < $now;
    }

    /**
     * @param \Blueways\BwBookingmanager\Domain\Model\Timeslot[] $timeslots
     * @return bool
     */
    private function getDayIsBookable($timeslots)
    {
        $isBookable = false;
        foreach ($timeslots as $timeslot) {
            $slotIsBookable = $timeslot->getIsBookable();
            if ($slotIsBookable) {
                $isBookable = true;
            }
        }

        return $isBookable;
    }

    private function isDirectBookable($entries)
    {
        return $this->calendar->isDirectBooking() && !sizeof($entries);
    }

    private function getWeeksArray($start, $numberOfWeeks)
    {
        $weeks = [];

        for ($i = 0; $i < $numberOfWeeks; $i++) {
            $weekStart = clone $start;

            $weeks[] = $this->getDaysArray($weekStart, 7);

            $weekStart->modify('next monday');
        }

        return $weeks;
    }
}
