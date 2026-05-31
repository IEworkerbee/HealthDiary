import { useState } from "react";
import HumanDiagram from "../components/HumanDiagram";
import { NavSideBar } from "../components/NavSideBar";
import { DiaryEntry } from "../components/DiaryEntry";
import { Button } from "react-bootstrap";
import type { JournalEntry } from "../scripts/models";

function DiaryLogger() {
  const [entry, setEntry] = useState<JournalEntry>({
    main_symptom: "",
    event_datetime: new Date(),
  });

  const handleLocationToggle = (bodyLocation: string) => {
    setEntry((prev) => {
      const current = prev.body_locations ?? [];
      const updated = current.includes(bodyLocation)
        ? current.filter((l) => l !== bodyLocation)
        : [...current, bodyLocation];
      return { ...prev, body_locations: updated };
    });
  };

  const handleSubmit = () => {
    console.log("Submitting entry:", entry);
    // TODO: CONNECT TO BACKEND
  };

  return (
    <>
      <NavSideBar />
      <HumanDiagram
        selectedLocations={entry.body_locations ?? []}
        onLocationToggle={handleLocationToggle}
      />
      <DiaryEntry entry={entry} onChange={setEntry} />
      <Button onClick={handleSubmit}>Submit</Button>
    </>
  );
}

export default DiaryLogger;
