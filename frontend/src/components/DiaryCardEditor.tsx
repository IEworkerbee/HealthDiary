import { useState } from "react";
import {
  Row,
  Card,
  Button,
  Nav,
  Tab,
  Form,
  Stack,
  Container,
  Col,
} from "react-bootstrap";
import { HumanDiagram } from "./HumanDiagram";
import type {
  JournalEntry,
  JournalEntryPackaged,
  MedicationLog,
} from "../scripts/models";
import { packageJournalEntry } from "../scripts/helperfuncs";
import { useNavigate } from "react-router";

interface Props {
  entry: JournalEntry;
  isNew: boolean;
}

interface Val {
  val: string | number | string[];
}

interface Logs {
  pain_level?: number;
  mood?: number;
  functional_impact?: string;
  triggers?: string[];
  body_locations?: string[];
  current_treatment?: string;
}

export const DiaryCardEditor = ({ entry, isNew }: Props) => {
  const [symptom, setSymptom] = useState<string | undefined>(
    entry.main_symptom,
  );
  const [notes, setNotes] = useState<string | undefined>(entry.notes);
  const [painLevel, setPainLevel] = useState<number | undefined>(
    entry.pain_level,
  );
  const [mood, setMood] = useState<number | undefined>(entry.mood);
  const [functionalImpact, setFunctionalImpact] = useState<string | undefined>(
    entry.functional_impact,
  );
  const [triggers, setTriggers] = useState<string[] | undefined>(
    entry.triggers,
  );
  const [bodyLocations, setBodyLocation] = useState<string[] | undefined>(
    entry.body_locations,
  );
  const [currentTreatment, setCurrentTreatment] = useState<string | undefined>(
    entry.current_treatment,
  );
  const [medications, setMedications] = useState<MedicationLog[] | undefined>(
    entry.medications,
  );

  const navigate = useNavigate();

  const onSubmit = async () => {
    const newEntry: JournalEntry = {
      ...entry,
      ...(symptom && { main_symptom: symptom }),
      ...(notes && { notes: notes }),
      ...(painLevel && { pain_level: painLevel }),
      ...(mood && { mood: mood }),
      ...(functionalImpact && { functional_impact: functionalImpact }),
      ...(triggers && { triggers: triggers }),
      ...(bodyLocations && { body_locations: bodyLocations }),
      ...(currentTreatment && { current_treatment: currentTreatment }),
      ...(medications && { medications: medications }),
    };
    const packagedJournalEntry: JournalEntryPackaged =
      packageJournalEntry(newEntry);
    const response = await fetch("/api/store_user_log", {
      method: "POST",
      body: JSON.stringify(packagedJournalEntry),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log(data);
    navigate(`/entry/${data.id}`);
  };

  const addMedication = () =>
    medications
      ? setMedications([...medications, { name: "" }])
      : setMedications([{ name: "" }]);

  const updateMedication = (i: number, fields: Partial<MedicationLog>) =>
    setMedications(
      medications?.map((m, idx) => (idx === i ? { ...m, ...fields } : m)),
    );

  const removeMedication = (i: number) => {
    console.log(i, medications);
    setMedications(medications?.filter((_, idx) => idx !== i));
  };

  const handleBodyClick = (location: string) => {
    setBodyLocation((prev) => {
      const current = prev ?? [];
      const updated = current.includes(location)
        ? current.filter((l) => l !== location)
        : [...current, location];
      return updated;
    });
  };

  let logs: Logs = Object.entries(entry).reduce((acc, [key, val]) => {
    if (
      [
        "pain_level",
        "mood",
        "functional_impact",
        "triggers",
        "body_locations",
        "current_treatment",
      ].includes(key) &&
      ((val && val.length !== 0) ||
        (isNew && entry.preferences_snapshot?.active_modules.includes(key)))
    ) {
      return { ...acc, [key]: val as Val };
    }
    return acc;
  }, {});
  if (logs.body_locations) {
    const { body_locations, ...rest } = logs;
    logs = { ...rest, body_locations };
  }

  const getFormType = (key: string, val: any) => {
    if (typeof val == "string" || typeof val === "object") {
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
      } else if (key === "Triggers") {
        return (
          <>
            <Form.Control
              type="text"
              value={
                triggers && triggers.length !== 0
                  ? triggers.join(", ")
                  : triggers
              }
              onChange={(e) => {
                setTriggers(e.target.value.split(", "));
              }}
            />
          </>
        );
      } else if (key === "Body Locations") {
        return (
          <>
            <HumanDiagram
              onLocationToggle={handleBodyClick}
              selectedLocations={bodyLocations ?? []}
            />
          </>
        );
      } else if (key === "Current Treatment") {
        return (
          <>
            <Form.Control
              type="text"
              value={currentTreatment}
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
            <Form.Range
              step={1}
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
                <Nav.Link
                  eventKey="third"
                  disabled={
                    !entry.preferences_snapshot?.active_modules.includes(
                      "medications",
                    )
                  }
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
                  <Card.Title>
                    <Form.Label>
                      Title (Symptom or Summary i.e "Headache" or "Meds")
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={symptom}
                      onChange={(e) => {
                        setSymptom(e.target.value);
                      }}
                    />
                  </Card.Title>
                  {entry.preferences_snapshot?.active_modules.includes(
                    "notes",
                  ) && (
                    <>
                      <Form.Label>Journal Notes</Form.Label>
                      <Form.Control
                        className="mb-2"
                        as="textarea"
                        rows={5}
                        value={notes}
                        onChange={(e) => {
                          setNotes(e.target.value);
                        }}
                        maxLength={5000}
                      />
                    </>
                  )}
                </Tab.Pane>
                <Tab.Pane eventKey="second">
                  <Card.Title>Pain Log</Card.Title>

                  {Object.entries(logs).map(([key, val], index) => {
                    const cleanedKey = key
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ");
                    if (cleanedKey === "Body Locations") {
                      return (
                        <div key={index}>
                          <Row className="mb-2 text-center">
                            <Form.Label>{cleanedKey}</Form.Label>
                          </Row>
                          <Row className="mb-2">
                            {getFormType(cleanedKey, val)}
                          </Row>
                        </div>
                      );
                    } else {
                      return (
                        <Row className="mb-2" key={index}>
                          <Col md={3}>
                            <Form.Label>{cleanedKey}</Form.Label>
                          </Col>
                          <Col md={9}>{getFormType(cleanedKey, val)}</Col>
                        </Row>
                      );
                    }
                  })}
                </Tab.Pane>
                <Tab.Pane eventKey="third">
                  <Card.Title>Medications Taken</Card.Title>
                  <Container className="mb-3">
                    {entry.preferences_snapshot?.active_modules.includes(
                      "medications",
                    ) && (
                      <>
                        {medications?.map((med, i) => (
                          <div key={i} className="mb-3">
                            <Stack gap={3} key={i}>
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
                                value={
                                  med.time_taken?.toISOString().slice(0, 16) ??
                                  ""
                                }
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
                            </Stack>
                          </div>
                        ))}

                        <Button variant="secondary" onClick={addMedication}>
                          + Add Medication
                        </Button>
                      </>
                    )}
                  </Container>
                </Tab.Pane>
              </Tab.Content>
              <Button onClick={onSubmit} variant="primary">
                Save Entry
              </Button>
            </Card.Body>
          </Card>
        </Tab.Container>
      </Form.Group>
    </>
  );
};
