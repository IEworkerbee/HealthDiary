import { useState } from "react";
import { Row, Card, Button, Nav, Tab, Table, Form } from "react-bootstrap";
import { HumanDiagram } from "./HumanDiagram";
import type { JournalEntry, MedicationLog } from "../scripts/models";

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
  const [medications, setMedications] = useState<MedicationLog[]>([]);

  const addMedication = () => setMedications([...medications, { name: "" }]);

  const updateMedication = (i: number, fields: Partial<MedicationLog>) =>
    setMedications(
      medications.map((m, idx) => (idx === i ? { ...m, ...fields } : m)),
    );

  const removeMedication = (i: number) =>
    setMedications(medications.filter((_, idx) => idx !== i));

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
      if (
        key === "Functional Impact" &&
        entry.preferences_snapshot?.active_modules.includes("functional_impact")
      ) {
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
      if (
        key === "Triggers" &&
        entry.preferences_snapshot?.active_modules.includes("triggers")
      ) {
        return (
          <>
            <Form.Control
              as="text"
              value={triggers.join(", ")}
              onChange={(e) => {
                setTriggers(e.target.value.split(", "));
              }}
            />
          </>
        );
      } else if (
        key === "Body Location" &&
        entry.preferences_snapshot?.active_modules.includes("body_location")
      ) {
        return (
          <>
            <HumanDiagram
              onLocationToggle={handleBodyClick}
              selectedLocations={bodyLocations}
            />
          </>
        );
      } else if (
        key === "Current Treatment" &&
        entry.preferences_snapshot?.active_modules.includes("current_treatment")
      ) {
        return (
          <>
            <Form.Control
              as="text"
              value={currentTreatment}
              onChange={(e) => {
                setCurrentTreatment(e.target.value);
              }}
            />
          </>
        );
      }
    } else if (typeof val == "number") {
      if (
        (key === "Pain Level" || "Mood") &&
        entry.preferences_snapshot?.active_modules.includes(
          key.toLowerCase().replaceAll(" ", "_"),
        )
      ) {
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

                  <Form.Label>Medications</Form.Label>
                  {entry.medications?.map((med, i) => (
                    <div key={i}>
                      <Form.Control
                        placeholder="Name"
                        value={med.name}
                        onChange={(e) =>
                          updateMedication(i, { name: e.target.value })
                        }
                      />
                      <Form.Control
                        type="number"
                        placeholder="Dosage"
                        value={med.dosage ?? ""}
                        onChange={(e) =>
                          updateMedication(i, {
                            dosage: Number(e.target.value),
                          })
                        }
                      />
                      <Form.Control
                        placeholder="Unit (mg, ml…)"
                        value={med.unit ?? ""}
                        onChange={(e) =>
                          updateMedication(i, { unit: e.target.value })
                        }
                      />
                      <Form.Control
                        type="datetime-local"
                        value={med.time_taken?.toISOString().slice(0, 16) ?? ""}
                        onChange={(e) =>
                          updateMedication(i, {
                            time_taken: new Date(e.target.value),
                          })
                        }
                      />
                      <Button
                        variant="danger"
                        onClick={() => removeMedication(i)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={addMedication}>
                    + Add Medication
                  </Button>
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
