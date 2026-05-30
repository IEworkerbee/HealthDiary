import { Container, Pagination } from "react-bootstrap";
import { useEffect, useState } from "react";
import { NavSideBar } from "../components/NavSideBar";
import { DiaryCard } from "../components/DiaryCard";
import type {
  JournalEntry,
  JournalEntryPackaged,
  MedicationLog,
} from "../scripts/models";

const Diary = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageNumbers = [1, 2, 3];

  useEffect(() => {
    const getDiaryEntries = async () => {
      const response = await fetch(`/api/userlogs/7/${(currentPage - 1) * 7}`);
      const data = (await response.json()).entries as JournalEntryPackaged[];
      const unpackedData: JournalEntry[] = data.map((entry) => {
        return {
          ...entry,
          event_datetime: new Date(entry.event_datetime),
          medications: entry.medications?.map((med) => {
            if (med.time_taken) {
              return {
                ...med,
                time_taken: new Date(med.time_taken),
              } as MedicationLog;
            } else {
              return med as MedicationLog;
            }
          }),
        };
      });
      setJournalEntries(unpackedData);
    };
    getDiaryEntries();
  }, []);

  return (
    <>
      <NavSideBar />
      <Container>
        {journalEntries.map((val, index) => {
          return <DiaryCard entry={val} key={index} />;
        })}
        <Pagination className="justify-content-center">
          <Pagination.First
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          />

          {pageNumbers.map((number) => (
            <Pagination.Item
              key={number}
              active={number === currentPage}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </Pagination.Item>
          ))}

          <Pagination.Next
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, pageNumbers.length))
            }
            disabled={currentPage === pageNumbers.length}
          />
          <Pagination.Last
            onClick={() => setCurrentPage(pageNumbers.length)}
            disabled={currentPage === pageNumbers.length}
          />
        </Pagination>
      </Container>
    </>
  );
};

export default Diary;
