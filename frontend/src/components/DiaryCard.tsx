import { Row, Col, Card, Button, Nav, Tab } from "react-bootstrap";
import type { JournalEntry } from "../scripts/models";

interface Props {
  entry: JournalEntry;
}

export const DiaryCard = ({ entry }: Props) => {
  const Logs = Object.entries(entry).reduce((acc, [key, val]) => {
    if (
      [
        "pain_level",
        "mood",
        "functional_impact",
        "triggers",
        "body_location",
        "current_treatment",
      ].includes(key) &&
      val
    ) {
      const cleaned_key = key
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
      return { ...acc, [cleaned_key]: val };
    }
    return acc;
  }, {});

  return (
    <Tab.Container defaultActiveKey="first">
      <Card className="my-3" border="primary">
        <Nav variant="tabs">
          <Nav.Item>
            <Nav.Link eventKey="first">Journal Entry</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="second"
              disabled={!Logs || Object.keys(Logs).length === 0}
            >
              Logs
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="third"
              disabled={!entry.medications || entry.medications.length === 0}
            >
              Medications
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Card.Header as="h5">{entry.date}</Card.Header>
        <Card.Body>
          <Tab.Content>
            <Tab.Pane eventKey="first">
              <Card.Title>{entry.symptom}</Card.Title>
              <Card.Text className="mb-2">
                {entry.notes ?? "No recorded entry."}
              </Card.Text>
            </Tab.Pane>
            <Tab.Pane eventKey="second">
              <Card.Title>Pain Log</Card.Title>
              <Card.Text>
                {Object.entries(Logs).map(([key, val], index) => {
                  return (
                    <Row className="mb-2" key={index}>
                      <Col sm={2}>
                        <strong>{key}</strong>
                      </Col>
                      <Col sm={10}>
                        {typeof val === "object"
                          ? JSON.stringify(val)
                          : String(val)}
                      </Col>
                    </Row>
                  );
                })}
              </Card.Text>
            </Tab.Pane>
            <Tab.Pane eventKey="third">
              <Card.Title>Medications Taken</Card.Title>
              <Card.Text>
                {entry.medications &&
                  entry.medications.map((val, index) => {
                    return (
                      <Row className="mb-2" key={index}>
                        {Object.entries(val).map(([key, val2], index2) => {
                          return (
                            <>
                              <Col sm={2} key={index2}>
                                <strong>{key}</strong>
                              </Col>
                              <Col sm={10} key={index2}>
                                {typeof val2 === "object"
                                  ? JSON.stringify(val2)
                                  : String(val2)}
                              </Col>
                            </>
                          );
                        })}
                      </Row>
                    );
                  })}
              </Card.Text>
            </Tab.Pane>
          </Tab.Content>
          <Button variant="primary">Edit Entry</Button>
        </Card.Body>
      </Card>
    </Tab.Container>
  );
};
