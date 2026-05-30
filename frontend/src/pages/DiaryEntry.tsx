import { useParams } from "react-router";
import { Container, Button } from "react-bootstrap";
import { DiaryCard } from "../components/DiaryCard";
import type { JournalEntry } from "../scripts/models";

const jentry: JournalEntry[] = [
  {
    symptom: "headache",
    date: new Date(),
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
  { symptom: "headache", date: new Date(Date.now() + 24 * 60 * 60 * 1000) },
];

const DiaryEntry = () => {
  const { entryID } = useParams();

  const entryToUse: JournalEntry = jentry[Number(entryID)];
  const year = entryToUse.date.getFullYear();
  const month = entryToUse.date.getMonth();

  return (
    <Container>
      <DiaryCard entry={entryToUse} />
      <Button href={`/calendar/${year}/${month}`}>Back to Calendar</Button>
    </Container>
  );
};

export default DiaryEntry;
