import { DiaryCardEditor } from "../components/DiaryCardEditor";
import { useParams } from "react-router";
import { Container, Button, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";
import type { JournalEntry, JournalEntryPackaged } from "../scripts/models";
import { unpackageJournalEntry } from "../scripts/helperfuncs";

const DiaryEntryEditor = () => {
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const { entryID } = useParams();

  useEffect(() => {
    const getEntry = async () => {
      const response = await fetch(`/api/fetch_user_log/${entryID}`);
      const data = (await response.json()) as JournalEntryPackaged;
      const final_data: JournalEntry = unpackageJournalEntry(data);

      if (final_data) {
        setEntry(final_data);
      }
    };
    getEntry();
  }, []);

  return (
    <Container>
      {entry && <DiaryCardEditor entry={entry} isNew={false} />}
      {!entry && <Alert>Something went wrong</Alert>}
      <Button href={`/diary`}>Back to Diary</Button>
    </Container>
  );
};

export default DiaryEntryEditor;
