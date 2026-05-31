import { useState, useEffect } from "react";
import {
  Calendar,
  momentLocalizer,
  Views,
  type View,
} from "react-big-calendar";
import { useNavigate } from "react-router";
import moment from "moment";
import type {
  JournalEvent,
  JournalEntry,
  JournalEntryPackaged,
} from "../scripts/models";
import { unpackageJournalEntry } from "../scripts/helperfuncs";
import { CalendarToolBar } from "./CalendarToolBar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface Props {
  year: string | undefined;
  month: string | undefined;
}

export const CalendarMonth = ({ year, month }: Props) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalEvents, setJournalEvents] = useState<JournalEvent[]>([]);
  const navigate = useNavigate();

  // This makes sure we are in the specific month and year passed to this by the Calendar
  useEffect(() => {
    if (year && month) {
      const targetDate = moment({
        year: parseInt(year),
        month: parseInt(month),
      });
      setCurrentDate(targetDate.isValid() ? targetDate.toDate() : new Date());
    } else {
      setCurrentDate(new Date());
    }
  }, []);

  // This grabs the Journal Entries for the month and year from the api
  useEffect(() => {
    const getJournalEntries = async () => {
      const response = await fetch(
        `/api/calendar/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}`,
      );
      const data = (await response.json()) as JournalEntryPackaged[];
      const unpackedData: JournalEntry[] = data.map((entry) => {
        return unpackageJournalEntry(entry);
      });
      setJournalEntries(unpackedData);
    };
    getJournalEntries();
  }, [currentDate]);

  // This converts Journal Entries into Journal Events for the Calendar
  useEffect(() => {
    const newJournalEvents = journalEntries.map((entry: JournalEntry) => {
      return {
        title: entry.main_symptom,
        start: entry.event_datetime,
        end: entry.event_datetime,
        route: `/entry/${entry._id}`,
      };
    });
    setJournalEvents(newJournalEvents);
  }, [journalEntries]);

  const handleSelectEvent = (event: JournalEvent) => {
    navigate(event.route);
  };

  return (
    <>
      <Calendar
        selectable
        localizer={localizer}
        events={journalEvents}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        date={currentDate}
        view={currentView}
        onNavigate={(newDate) => setCurrentDate(newDate)}
        onView={(newView) => setCurrentView(newView)}
        style={{ height: "40rem" }}
        components={{ toolbar: CalendarToolBar }}
      />
    </>
  );
};
