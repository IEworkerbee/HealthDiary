import { useParams } from "react-router";

import { DiaryCard } from "../components/DiaryCard";
import type { JournalEntry } from "../scripts/models";

const jentry: JournalEntry[] = [
  {
    symptom: "headache",
    date: "5/28/2026",
    notes: [
      "So much I love cats and Lorem Ipsum testing cats lorem ipsum testing cats lorem ipusmin tatlja;j fifodjosdijfoisjdfjoiesjfoijsoijfojsoijfsjoifjsoijfoijsfoijes",
    ],
    pain_level: 5,
    mood: 2,
    functional_impact: 3,
    medications: [
      { name: "Sertraline", dosage: 100, unit: "mg" },
      { name: "Atomoxetine" },
    ],
  },
  { symptom: "headache", date: "5/29/2026" },
];

const DiaryEntry = () => {
  const { entryID } = useParams();

  return <DiaryCard entry={jentry[Number(entryID)]} fromCalendar={true} />;
};

export default DiaryEntry;
