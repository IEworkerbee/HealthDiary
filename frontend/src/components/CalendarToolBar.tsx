import React from "react";
import { type ToolbarProps, Navigate } from "react-big-calendar";
import { Form, Row, Col, ButtonGroup, Button } from "react-bootstrap";

export const CalendarToolBar: React.FC<ToolbarProps<any, any>> = ({
  date,
  onNavigate,
  label,
}) => {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();

  const years = Array.from({ length: 11 }, (_, i) => currentYear - 10 + i);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    const newDate = new Date(date.getFullYear(), newMonth, 1);
    onNavigate(Navigate.DATE, newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    const newDate = new Date(newYear, date.getMonth(), 1);
    onNavigate(Navigate.DATE, newDate);
  };

  return (
    <Row className="align-items-center mb-3 g-2">
      <Col xs="auto">
        <ButtonGroup size="sm">
          <Button
            variant="outline-secondary"
            onClick={() => onNavigate(Navigate.PREVIOUS)}
          >
            Back
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => onNavigate(Navigate.TODAY)}
          >
            Today
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => onNavigate(Navigate.NEXT)}
          >
            Next
          </Button>
        </ButtonGroup>
      </Col>
      <Col xs="auto">
        <Form.Select
          size="sm"
          value={currentMonth}
          onChange={handleMonthChange}
          aria-label="Select Month"
        >
          {months.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </Form.Select>
      </Col>

      {/* Year Dropdown */}
      <Col xs="auto">
        <Form.Select
          size="sm"
          value={currentYear}
          onChange={handleYearChange}
          aria-label="Select Year"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Form.Select>
      </Col>
      <Col className="text-end">
        <h5 className="mb-0">{label}</h5>
      </Col>
    </Row>
  );
};
