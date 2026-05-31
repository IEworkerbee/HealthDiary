// Maintians python variable names for conversion
export interface MedicationLog {
  name: string;
  dosage?: number;
  unit?: string;
  time_taken?: Date;
}

export interface MedicationLogPackaged {
  name: string;
  dosage?: number;
  unit?: string;
  time_taken?: string;
}

export interface SymptomRating {
  name: string;
  value: number;
}

export interface PreferencesSnapshot {
  active_modules: string[];
  module_order: string[];
  snapshot_version: number;
}

export interface JournalEntryPackaged {
  _id?: string;
  main_symptom: string;
  event_datetime: string;
  pain_level?: number;
  mood?: number;
  functional_impact?: string;
  medications?: MedicationLogPackaged[];
  triggers?: string[];
  notes?: string;
  body_locations?: string[];
  current_treatment?: string;
  custom_ratings?: SymptomRating[];
  tags?: string[];
  preferences_snapshot?: PreferencesSnapshot;
}

export interface JournalEntry {
  _id?: string;
  main_symptom: string;
  event_datetime: Date;
  pain_level?: number;
  mood?: number;
  functional_impact?: string;
  medications?: MedicationLog[];
  triggers?: string[];
  notes?: string;
  body_locations?: string[];
  current_treatment?: string;
  custom_ratings?: SymptomRating[];
  tags?: string[];
  preferences_snapshot?: PreferencesSnapshot;
}

// For Calendar stuff
export interface JournalEvent {
  title: string;
  start: Date;
  end: Date;
  route: string;
}
