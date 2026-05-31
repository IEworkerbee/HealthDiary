import { useParams } from "react-router";
import { Container, Button, Alert } from "react-bootstrap";
import { DiaryCard } from "../components/DiaryCard";
import { useEffect, useState } from "react";
import type { JournalEntry, JournalEntryPackaged } from "../scripts/models";
import { unpackageJournalEntry } from "../scripts/helperfuncs";

const DiaryEntry = () => {
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [year, setYear] = useState<number>(0);
  const [month, setMonth] = useState<number>(0);
  const { entryID } = useParams();

  useEffect(() => {
    const getEntry = async () => {
      const response = await fetch(`/api/fetch_user_log/${entryID}`);
      const data = (await response.json()) as JournalEntryPackaged;
      const final_data: JournalEntry = unpackageJournalEntry(data);

      if (final_data) {
        setEntry(final_data);
        setYear(final_data.event_datetime.getFullYear());
        setMonth(final_data.event_datetime.getMonth());
      }
    };
    getEntry();
  }, []);

  return (
    <Container>
      {entry && <DiaryCard entry={entry} />}
      {!entry && <Alert>Something went wrong</Alert>}
      <Button href={`/calendar/${year}/${month}`}>Back to Calendar</Button>
    </Container>
  );
};

export default DiaryEntry;
