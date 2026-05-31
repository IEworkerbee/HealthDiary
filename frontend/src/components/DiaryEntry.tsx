import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import type {
  JournalEntry,
  MedicationLog,
  SymptomRating,
} from "../scripts/models";

interface DiaryEntryProps {
  entry: JournalEntry;
  onChange: React.Dispatch<React.SetStateAction<JournalEntry>>;
}

export const DiaryEntry = ({ entry, onChange }: DiaryEntryProps) => {
  const set = (fields: Partial<JournalEntry>) =>
    onChange((prev) => ({ ...prev, ...fields }));

  // --- Medications ---
  const addMedication = () =>
    set({ medications: [...(entry.medications ?? []), { name: "" }] });

  const updateMedication = (i: number, fields: Partial<MedicationLog>) =>
    set({
      medications: entry.medications?.map((m, idx) =>
        idx === i ? { ...m, ...fields } : m,
      ),
    });

  const removeMedication = (i: number) =>
    set({ medications: entry.medications?.filter((_, idx) => idx !== i) });

  // --- Custom Ratings ---
  const addRating = () =>
    set({
      custom_ratings: [...(entry.custom_ratings ?? []), { name: "", value: 0 }],
    });

  const updateRating = (i: number, fields: Partial<SymptomRating>) =>
    set({
      custom_ratings: entry.custom_ratings?.map((r, idx) =>
        idx === i ? { ...r, ...fields } : r,
      ),
    });

  const removeRating = (i: number) =>
    set({
      custom_ratings: entry.custom_ratings?.filter((_, idx) => idx !== i),
    });

  // Triggers / Tags (comma-separated for simplicity)
  const [triggersInput, setTriggersInput] = useState(
    entry.triggers?.join(", ") ?? "",
  );
  const [tagsInput, setTagsInput] = useState(entry.tags?.join(", ") ?? "");

  return (
    <Form>
      {/* Core fields */}
      <Form.Group>
        <Form.Label>Main Symptom *</Form.Label>
        <Form.Control
          value={entry.main_symptom}
          onChange={(e) => set({ main_symptom: e.target.value })}
          placeholder="e.g. headache, fatigue"
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Date & Time *</Form.Label>
        <Form.Control
          type="datetime-local"
          value={entry.event_datetime.toISOString().slice(0, 16)}
          onChange={(e) => set({ event_datetime: new Date(e.target.value) })}
        />
      </Form.Group>

      {/* Numeric sliders */}
      {(["pain_level", "mood", "functional_impact"] as const).map((field) => (
        <Form.Group key={field}>
          <Form.Label>{field.replace("_", " ")} (0–10)</Form.Label>
          <Form.Range
            min={0}
            max={10}
            step={1}
            value={entry[field] ?? 0}
            onChange={(e) => set({ [field]: Number(e.target.value) })}
          />
          <span>{entry[field] ?? 0}</span>
        </Form.Group>
      ))}

      {/* Medications */}
      <Form.Group>
        <Form.Label>Medications</Form.Label>
        {entry.medications?.map((med, i) => (
          <div key={i}>
            <Form.Control
              placeholder="Name"
              value={med.name}
              onChange={(e) => updateMedication(i, { name: e.target.value })}
            />
            <Form.Control
              type="number"
              placeholder="Dosage"
              value={med.dosage ?? ""}
              onChange={(e) =>
                updateMedication(i, { dosage: Number(e.target.value) })
              }
            />
            <Form.Control
              placeholder="Unit (mg, ml…)"
              value={med.unit ?? ""}
              onChange={(e) => updateMedication(i, { unit: e.target.value })}
            />
            <Form.Control
              type="datetime-local"
              value={med.time_taken?.toISOString().slice(0, 16) ?? ""}
              onChange={(e) =>
                updateMedication(i, { time_taken: new Date(e.target.value) })
              }
            />
            <Button variant="danger" onClick={() => removeMedication(i)}>
              Remove
            </Button>
          </div>
        ))}
        <Button variant="secondary" onClick={addMedication}>
          + Add Medication
        </Button>
      </Form.Group>

      {/* Triggers */}
      <Form.Group>
        <Form.Label>Triggers (comma-separated)</Form.Label>
        <Form.Control
          value={triggersInput}
          onChange={(e) => {
            setTriggersInput(e.target.value);
            set({
              triggers: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            });
          }}
          placeholder="e.g. stress, poor sleep"
        />
      </Form.Group>

      {/* Notes */}
      <Form.Group>
        <Form.Label>Notes</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={entry.notes ?? ""}
          onChange={(e) => set({ notes: e.target.value })}
        />
      </Form.Group>

      {/* Current Treatment */}
      <Form.Group>
        <Form.Label>Current Treatment</Form.Label>
        <Form.Control
          value={entry.current_treatment ?? ""}
          onChange={(e) => set({ current_treatment: e.target.value })}
        />
      </Form.Group>

      {/* Custom Ratings */}
      <Form.Group>
        <Form.Label>Custom Ratings</Form.Label>
        {entry.custom_ratings?.map((rating, i) => (
          <div key={i}>
            <Form.Control
              placeholder="Rating name"
              value={rating.name}
              onChange={(e) => updateRating(i, { name: e.target.value })}
            />
            <Form.Range
              min={0}
              max={10}
              step={1}
              value={rating.value}
              onChange={(e) =>
                updateRating(i, { value: Number(e.target.value) })
              }
            />
            <span>{rating.value}</span>
            <Button variant="danger" onClick={() => removeRating(i)}>
              Remove
            </Button>
          </div>
        ))}
        <Button variant="secondary" onClick={addRating}>
          + Add Rating
        </Button>
      </Form.Group>

      {/* Tags */}
      <Form.Group>
        <Form.Label>Tags (comma-separated)</Form.Label>
        <Form.Control
          value={tagsInput}
          onChange={(e) => {
            setTagsInput(e.target.value);
            set({
              tags: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            });
          }}
          placeholder="e.g. migraine, flare-up"
        />
      </Form.Group>
    </Form>
  );
};
