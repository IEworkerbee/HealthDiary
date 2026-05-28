"""
Pydantic v2 models for HealthDiary.
Last edit Ryder Gilman May 25th

These models live between the UI (Flask routes, later) and MongoDB. They:

1. Validate user data before it ever hits the database.
2. Document the shape of every document type in one place.
3. Provide a `.model_dump()` that produces the exact dict inserted into Mongo.

The `db/connection.py` module provides a `get_database()` function 
that returns a connected `Database` object. 
Use that to get collections and then use these models to validate 
data before inserting or updating.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

class FunctionalImpact(str, Enum):
    """How much the event interfered with normal activities"""

    NONE = "none"
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    UNABLE = "unable"


class BodyLocation(str, Enum):
    """
    Body locations users can tag on an entry

    """

    HEAD = "head"
    NECK = "neck"
    CHEST = "chest"
    BELLY = "belly"
    SHOULDER = "shoulder"
    UPPERBACK = "upperback"
    LOWERBACK = "lowerback"
    UPPERLEFTARM = "upperleftarm"
    LOWERLEFTARM = "lowerleftarm"
    UPPERRIGHTARM = "upperrightarm"
    LOWERRIGHTARM = "lowerrightarm"
    LEFTHAND = "lefthand"
    RIGHTHAND = "righthand"
    UPPERLEFTLEG = "upperleftleg"
    LOWERLEFTLEG = "lowerleftleg"
    UPPERRIGHTLEG = "upperrightleg"
    LOWERRIGHTLEG = "lowerrightleg"
    LEFTFOOT = "leftfoot"
    RIGHTFOOT = "rightfoot"

KNOWN_MODULES = (
    "pain_level",
    "mood",
    "medications",
    "triggers",
    "notes",
    "body_locations",
    "functional_impact",
    "current_treatment",
    "custom_ratings",
    "tags",
)

class MedicationLog(BaseModel):
    """A single medication the user took as part of an event."""

    # Pydantic v2 config: forbid stray fields so typos surface in tests.
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, description="Medication name, e.g. 'Ibuprofen'")
    dosage: Optional[float] = Field(default=None, ge=0, description="Numeric dose; unit lives in `unit`")
    unit: Optional[str] = Field(default=None, description="e.g. 'mg', 'ml', 'tablet'")

    time_taken: Optional[datetime] = None

    @field_validator("name")
    @classmethod
    def _name_must_not_be_whitespace(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("medication name cannot be empty")
        return v
    
class SymptomRating(BaseModel):
    """A user-defined symptom with a 1-10 rating (custom modules)."""

    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, description="e.g. 'brain_fog', 'nausea'")
    # The spec allows numeric ratings 1-10. We do not support non-numeric
    # ratings on purpose - keeps the PDF generator's job simple.
    value: int = Field(ge=1, le=10)

    @field_validator("name")
    @classmethod
    def _name_must_not_be_whitespace(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("symptom rating name cannot be empty")
        return v

class PreferencesSnapshot(BaseModel):
    """
    A frozen copy of the user's preferences AT THE TIME an entry was logged.

    This lives inside every JournalEntry so that changing preferences later
    never reshapes old data (requirement #7 in the project spec).
    """

    model_config = ConfigDict(extra="forbid")

    active_modules: List[str] = Field(default_factory=list)
    module_order: List[str] = Field(default_factory=list)
    snapshot_version: int = 1


# ---------------------------------------------------------------------------
# Top-level documents
# ---------------------------------------------------------------------------


# How far into the future we accept `event_datetime` - allows for a little
# clock skew between the client device and the server.
_FUTURE_GRACE = timedelta(minutes=5)


class JournalEntry(BaseModel):
    """
    One symptom/event log. This is the bread-and-butter document of the app.

    Only `main_symptom` and `event_datetime` are required. Every other field
    is optional so users only fill in the modules they've enabled.
    """

    model_config = ConfigDict(extra="forbid", use_enum_values=True)

    # --- Required ---------------------------------------------------------
    main_symptom: str = Field(min_length=1, description="Short label, e.g. 'migraine'")
    event_datetime: datetime = Field(description="When the event/flare happened")

    # --- Optional ---------------------------------------------------------
    pain_level: Optional[int] = Field(default=None, ge=1, le=10)
    mood: Optional[int] = Field(default=None, ge=1, le=10)
    functional_impact: Optional[FunctionalImpact] = None
    medications: List[MedicationLog] = Field(default_factory=list)
    triggers: List[str] = Field(default_factory=list)
    notes: Optional[str] = Field(default=None, max_length=5000)
    body_locations: List[BodyLocation] = Field(default_factory=list)
    current_treatment: Optional[str] = None
    custom_ratings: List[SymptomRating] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

    # Snapshot of preferences when the entry was created. The repository
    # layer fills this in if the caller doesn't provide one.
    preferences_snapshot: Optional[PreferencesSnapshot] = None

    # --- Validators -------------------------------------------------------
    """"Pydantic gives validators that help enforce constraints easier than 
    assertion tests. These field validators were built by Claude to ensure clean data """

    @field_validator("main_symptom")
    @classmethod
    def _strip_main_symptom(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("main_symptom cannot be empty")
        return v

    @field_validator("event_datetime")
    @classmethod
    def _not_too_far_in_future(cls, v: datetime) -> datetime:
        # Treat naive datetimes as UTC so the comparison is well-defined.
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v > datetime.now(timezone.utc) + _FUTURE_GRACE:
            raise ValueError("event_datetime is more than 5 minutes in the future")
        return v

    @field_validator("triggers")
    @classmethod
    def _no_empty_triggers(cls, v: List[str]) -> List[str]:
        cleaned = [t.strip() for t in v]
        if any(not t for t in cleaned):
            raise ValueError("triggers cannot contain empty strings")
        return cleaned

    @field_validator("tags")
    @classmethod
    def _normalize_tags(cls, v: List[str]) -> List[str]:
        
        seen = set()
        result: List[str] = []
        for tag in v:
            t = tag.strip().lower()
            if not t or t in seen:
                continue
            seen.add(t)
            result.append(t)
        return result
    

class UserPreferences(BaseModel):
    """
    Which symptom modules to show in the UI, and in what order.

    Stored as a single document with `_id="active"` in the `preferences`
    collection. There is only ever one active preferences doc per local user.
    """

    model_config = ConfigDict(extra="forbid")

    active_modules: List[str] = Field(
        default_factory=lambda: list(KNOWN_MODULES),
        description="Module names currently enabled in the UI",
    )
    module_order: List[str] = Field(
        default_factory=lambda: list(KNOWN_MODULES),
        description="Display order for the modules above",
    )
    snapshot_version: int = Field(default=1, ge=1)

    @model_validator(mode="after")
    def _modules_must_be_known_and_consistent(self) -> "UserPreferences":
        # Reject unknown module names so a typo doesn't silently disable a section.
        for name in self.active_modules:
            if name not in KNOWN_MODULES:
                raise ValueError(f"unknown module in active_modules: {name!r}")
        for name in self.module_order:
            if name not in KNOWN_MODULES:
                raise ValueError(f"unknown module in module_order: {name!r}")
        # module_order must at least mention every active module.
        missing = set(self.active_modules) - set(self.module_order)
        if missing:
            raise ValueError(f"module_order is missing active modules: {sorted(missing)}")
        return self

    def to_snapshot(self) -> PreferencesSnapshot:
        """Convert the live preferences into the embedded snapshot shape."""
        return PreferencesSnapshot(
            active_modules=list(self.active_modules),
            module_order=list(self.module_order),
            snapshot_version=self.snapshot_version,
        )


class PDFExportRecord(BaseModel):
    """
    Metadata for one generated PDF export.

    The actual PDF file lives on disk; this document just records *that*
    an export happened, what filters produced it, and where to find the
    file again. Useful for the "Recent Exports" list and for audit/recovery.
    """

    model_config = ConfigDict(extra="forbid")

    # --- Required ---------------------------------------------------------
    filename: str = Field(min_length=1, description="Generated file name, e.g. 'healthdiary-2026-05.pdf'")
    entry_count: int = Field(ge=0, description="How many journal entries were included")

    # --- Optional ---------------------------------------------------------
    storage_path: Optional[str] = Field(default=None, description="Absolute or app-relative path on disk")
    file_size_bytes: Optional[int] = Field(default=None, ge=0)
    label: Optional[str] = Field(default=None, max_length=200, description="User-provided name for this export")

    # The filters that produced this export, so it can be regenerated or
    # described to the user. We deliberately keep this small and explicit
    # rather than dumping arbitrary query JSON.
    date_range_start: Optional[datetime] = None
    date_range_end: Optional[datetime] = None
    main_symptom: Optional[str] = None
    min_pain: Optional[int] = Field(default=None, ge=1, le=10)
    max_pain: Optional[int] = Field(default=None, ge=1, le=10)
    trigger: Optional[str] = None
    tag: Optional[str] = None

    @field_validator("filename")
    @classmethod
    def _filename_must_not_be_whitespace(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("filename cannot be empty")
        return v

    @model_validator(mode="after")
    def _date_range_and_pain_range_must_be_ordered(self) -> "PDFExportRecord":
        if (
            self.date_range_start is not None
            and self.date_range_end is not None
            and self.date_range_start > self.date_range_end
        ):
            raise ValueError("date_range_start must be <= date_range_end")
        if (
            self.min_pain is not None
            and self.max_pain is not None
            and self.min_pain > self.max_pain
        ):
            raise ValueError("min_pain must be <= max_pain")
        return self

