import { Button } from "react-bootstrap";
import type { JournalEntryPackaged } from "../scripts/models";
import { formatToPythonString } from "../scripts/helperfuncs";

const TempJournalEntryInserter = () => {
  const sendJournalEntry = async () => {
    const journalEntries: JournalEntryPackaged = {
      main_symptom: "headache",
      event_datetime: formatToPythonString(new Date()),
      notes:
        "So much I love cats and Lorem Ipsum testing cats lorem ipsum testing cats lorem ipusmin tatlja;j fifodjosdijfoisjdfjoiesjfoijsoijfojsoijfsjoifjsoijfoijsfoijes",
      pain_level: 5,
      mood: 2,
      functional_impact: 3,
      medications: [
        { name: "Sertraline", dosage: 100, unit: "mg" },
        { name: "Atomoxetine" },
      ],
    };

    const response = await fetch("/api/store_user_log", {
      method: "POST",
      body: JSON.stringify(journalEntries),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log(data.message);
  };
  return <Button onClick={sendJournalEntry}>insert_data</Button>;
};

export default TempJournalEntryInserter;
