import type {JournalEntryPackaged, JournalEntry, MedicationLog, MedicationLogPackaged} from "./models.ts"

export function formatToPythonString(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, '0');

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function unpackageJournalEntry(entry: JournalEntryPackaged) {
  const unpackagedJournalEntry: JournalEntry = 
    { ...entry,
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
    }),}

  return unpackagedJournalEntry;
}

export function packageJournalEntry(entry: JournalEntry) {
  const packagedJournalEntry: JournalEntryPackaged = {
    ... entry,
    event_datetime: formatToPythonString(entry.event_datetime),
    medications: entry.medications?.map((med) => {
      if (med.time_taken) {
        return {
          ... med,
          time_taken: formatToPythonString(med.time_taken),
        } as MedicationLogPackaged
      } else {
        return med as MedicationLogPackaged
      }
    }),
  }
  
  return packagedJournalEntry;
}