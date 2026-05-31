import { useState } from "react";
import { Row, Card, Button, Nav, Tab, Table, Form } from "react-bootstrap";
import { HumanDiagram } from "./HumanDiagram";
import type { JournalEntry } from "../scripts/models";

interface Props {
  entry: JournalEntry;
}

interface Val {
  val: string | number;
}

export const DiaryCardEditor = ({ entry }: Props) => {
  const [painLevel, setPainLevel] = useState<number>(1);
  const [mood, setMood] = useState<number>(1);
  const [functionalImpact, setFunctionalImpact] = useState<string>("");
  const [triggers, setTriggers] = useState<string[]>([]);
  const [bodyLocations, setBodyLocation] = useState<string[]>([]);
  const [currentTreatment, setCurrentTreatment] = useState<string>("");

  const handleBodyClick = (location: string) => {
    location &&
      setBodyLocation((prev) => {
        const current = prev ?? [];
        const updated = current.includes(location)
          ? current.filter((l) => l !== location)
          : [...current, location];
        return updated;
      });
  };

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
      val &&
      val.length !== 0
    ) {
      const cleanedKey = key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return { ...acc, [cleanedKey]: val as Val };
    }
    return acc;
  }, {});

  const getFormType = (key: string, val: any) => {
    if (typeof val == "string") {
      if (key === "Functional Impact") {
        return (
          <>
            <Form.Select
              value={functionalImpact}
              onChange={(e) => setFunctionalImpact(e.target.value)}
            >
              <option value="none">No Impact</option>
              <option value="mild">Mild Impact</option>
              <option value="moderate">Moderate Impact</option>
              <option value="severe">Severe Impact</option>
              <option value="unable">Inabling Impact</option>
            </Form.Select>
          </>
        );
      }
      if (key === "Triggers") {
        return (
          <>
            <Form.Control
              as="text"
              placeholder={triggers.join(", ")}
              onChange={(e) => {
                setTriggers(e.target.value.split(", "));
              }}
            />
          </>
        );
      } else if (key === "Body Location") {
        return (
          <>
            <HumanDiagram
              onLocationToggle={handleBodyClick}
              selectedLocations={bodyLocations}
            />
          </>
        );
      } else if (key === "Current Treatment") {
        return (
          <>
            <Form.Control
              as="text"
              placeholder={currentTreatment}
              onChange={(e) => {
                setCurrentTreatment(e.target.value);
              }}
            />
          </>
        );
      }
    } else if (typeof val == "number") {
      if (key === "Pain Level" || "Mood") {
        return (
          <>
            <Form.Control
              type="number"
              min={1}
              max={10}
              value={key === "Pain Level" ? painLevel : mood}
              onChange={(e) => {
                key === "Pain Level"
                  ? setPainLevel(parseInt(e.target.value))
                  : setMood(parseInt(e.target.value));
              }}
            />
          </>
        );
      }
    } else {
      return;
    }
  };

  const medicationHeaders = ["Name", "Dosage", "Unit", "Time"];
  return (
    <>
      <Form.Group className="mb-3" controlId="formControl">
        <Tab.Container defaultActiveKey="first">
          <Card className="my-3" border="primary">
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="first">Journal Entry</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="second">Logs</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="third">Medications</Nav.Link>
              </Nav.Item>
            </Nav>
            <Card.Header as="h5">
              {entry.event_datetime.toLocaleDateString()}
            </Card.Header>
            <Card.Body>
              <Tab.Content>
                <Tab.Pane eventKey="first">
                  <Card.Title>
                    {entry.main_symptom}
                    <Form.Label>
                      Title (Symptom or Summary i.e "Headache" or "Meds")
                    </Form.Label>
                    <Form.Control
                      as="text"
                      placeholder={entry.main_symptom ?? "title"}
                    />
                  </Card.Title>
                  <Form.Label>Journal Notes</Form.Label>
                  <Form.Control
                    className="mb-2"
                    as="textarea"
                    rows={5}
                    placeholder={entry.notes ?? "No recorded entry."}
                    maxLength={5000}
                  />
                </Tab.Pane>
                <Tab.Pane eventKey="second">
                  <Card.Title>Pain Log</Card.Title>

                  {Object.entries(logs).map(([key, val], index) => {
                    return (
                      <Row className="mb-2" key={index}>
                        <Form.Label>{key}</Form.Label>
                        {getFormType(key, val)}
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
      </Form.Group>
    </>
  );
};
