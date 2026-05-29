import { Container } from "react-bootstrap";
import { NavSideBar } from "../components/NavSideBar";
import { DiaryCard } from "../components/DiaryCard";
import type { JournalEntry } from "../scripts/models";

const Diary = () => {
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
  return (
    <>
      <NavSideBar />
      <Container>
        {jentry.map((val, index) => {
          return <DiaryCard entry={val} key={index} />;
        })}
      </Container>
    </>
  );
};

export default Diary;
