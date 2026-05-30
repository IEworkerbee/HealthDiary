import { NavSideBar } from "../components/NavSideBar";
import { CalendarMonth } from "../components/CalendarMonth";
import { Container } from "react-bootstrap";
import { useParams } from "react-router";

const Calendars = () => {
  const { year, month } = useParams();

  return (
    <>
      <NavSideBar />
      <Container>
        <CalendarMonth year={year} month={month} />
      </Container>
    </>
  );
};

export default Calendars;
