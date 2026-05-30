import { useState, useEffect } from "react";
import {
  Calendar,
  momentLocalizer,
  Views,
  type View,
} from "react-big-calendar";
import { useNavigate } from "react-router";
import moment from "moment";
import type { JournalEvent } from "../scripts/models";
import { CalendarToolBar } from "./CalendarToolBar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const journalEvents: JournalEvent[] = [
  {
    title: "Entry 1",
    start: moment().toDate(),
    end: moment().toDate(),
    route: "/entry/1",
  },
  {
    title: "Entry 0",
    start: moment().subtract(2, "days").toDate(),
    end: moment().subtract(2, "days").toDate(),
    route: "/entry/0",
  },
];

interface Props {
  year: string | undefined;
  month: string | undefined;
}

export const CalendarMonth = ({ year, month }: Props) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const navigate = useNavigate();

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
