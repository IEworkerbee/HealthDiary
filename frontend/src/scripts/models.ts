// Maintians python variable names for conversion
export interface MedicationLog {
    name: string;
    dosage?: number;
    unit?: string;
    time_taken?: string;
}

export interface SymptomRating {
    name: string
    value: number
}

export interface PreferencesSnapshot {
  active_modules: string[];
  module_order: string[];
  snapshot_version: number;
}

export interface JournalEntry {
    symptom: string;
    date: string;
    pain_level?: number;
    mood?: number;
    functional_impact?: number;
    medications?: MedicationLog[]
    triggers?: string[]
    notes?: string[];
    body_locations?: number[];
    current_treatment?: string;
    custom_ratings?: SymptomRating[]
    tags?: string[]
    preferences_snapshot?: PreferencesSnapshot
}

// For Calendar stuff
export interface JournalEvent {
  title: string;
  start: Date;
  end: Date;
  route: string;
}