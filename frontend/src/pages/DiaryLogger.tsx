import { NavSideBar } from "../components/NavSideBar";
import { DiaryCardEditor } from "../components/DiaryCardEditor";
import type { JournalEntry } from "../scripts/models";
import { Container } from "react-bootstrap";

function DiaryLogger() {
  const entry: JournalEntry = {
    main_symptom: "",
    event_datetime: new Date(),
    pain_level: 1,
    mood: 1,
    functional_impact: "none",
    medications: [],
    triggers: [],
    notes: "",
    body_locations: [],
    current_treatment: "",
    preferences_snapshot: {
      // TODO: This needs to be hooked up to settings or something
      active_modules: [
        "pain_level",
        "mood",
        "triggers",
        "functional_impact",
        "body_locations",
        "medications",
        "current_treatment",
        "custom_ratings",
      ],
      module_order: [],
      snapshot_version: 0,
    },
  };

  return (
    <>
      <NavSideBar />
      <Container>
        <DiaryCardEditor entry={entry} />
      </Container>
    </>
  );
}

export default DiaryLogger;
