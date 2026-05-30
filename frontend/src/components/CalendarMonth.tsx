import { Calendar, momentLocalizer } from "react-big-calendar";
import { useNavigate } from "react-router";
import moment from "moment";
import type { JournalEvent } from "../scripts/models";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const eventsList: JournalEvent[] = [
  {
    title: "car",
    start: moment().toDate(),
    end: moment().toDate(),
    route: "/entry/1",
  },
];

export const CalendarMonth = () => {
  const navigate = useNavigate();

  const handleSelectEvent = (event: JournalEvent) => {
    navigate(event.route);
  };

  return (
    <>
      <Calendar
        selectable
        localizer={localizer}
        events={eventsList}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        style={{ height: "77vh" }}
      />
    </>
  );
};
