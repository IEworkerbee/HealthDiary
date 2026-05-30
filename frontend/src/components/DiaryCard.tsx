import { Row, Col, Card, Button, Nav, Tab, Table } from "react-bootstrap";
import type { JournalEntry } from "../scripts/models";

interface Props {
  entry: JournalEntry;
}

export const DiaryCard = ({ entry }: Props) => {
  const logs = Object.entries(entry).reduce((acc, [key, val]) => {
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
      const cleanedKey = key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return { ...acc, [cleanedKey]: val };
    }
    return acc;
  }, {});

  const medicationHeaders = ["Name", "Dosage", "Unit", "Time"];
  return (
    <>
      <Tab.Container defaultActiveKey="first">
        <Card className="my-3" border="primary">
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link eventKey="first">Journal Entry</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="second"
                disabled={!logs || Object.keys(logs).length === 0}
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
          <Card.Header as="h5">
            {entry.event_datetime.toLocaleDateString()}
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="first">
                <Card.Title>{entry.main_symptom}</Card.Title>
                <Card.Text className="mb-2">
                  {entry.notes ?? "No recorded entry."}
                </Card.Text>
              </Tab.Pane>
              <Tab.Pane eventKey="second">
                <Card.Title>Pain Log</Card.Title>

                {Object.entries(logs).map(([key, val], index) => {
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
              </Tab.Pane>
              <Tab.Pane eventKey="third">
                <Card.Title>Medications Taken</Card.Title>

                {entry.medications && (
                  <Table striped bordered responsive>
                    <thead>
                      <tr>
                        {medicationHeaders?.map((header, index) => {
                          return <th key={index}>{String(header)}</th>;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {entry.medications.map((val, index) => {
                        return (
                          <tr key={index}>
                            {medicationHeaders.map((_, index2) => {
                              return (
                                <td key={index2}>
                                  {Object.values(val)[index2]
                                    ? String(Object.values(val)[index2])
                                    : "-"}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </Tab.Pane>
            </Tab.Content>
            <Button variant="primary">Edit Entry</Button>
          </Card.Body>
        </Card>
      </Tab.Container>
    </>
  );
};
