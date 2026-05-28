"""Repository for database operations.
Last edit Ryder Gilman May 27th

This module defines the data models for entries and provides functions to interact with the MongoDB database. 
It uses the `pydantic` library for data validation and serialization. 

This module contains all logic related to data storage and retrieval, 
so that the rest of the application can interact only with this module. 

Sections:
    * Journal entry CRUD + search
    * Preferences CRUD
    * PDF export record CRUD
    * Local user profile read/write

"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Mapping, Optional, Union

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ASCENDING, DESCENDING

from .connection import get_database
from .models import (
    JournalEntry,
    PDFExportRecord,
    UserPreferences,
)

#Collection names. 

USER_PROFILE = "user_profile"
PREFERENCES = "preferences"
JOURNAL_ENTRIES = "journal_entries"
PDF_EXPORTS = "pdf_exports"


LOCAL_USER_ID = "local_user"
ACTIVE_PREFS_ID = "active"

# Helpers 
def _doc_out(doc: Optional[Mapping[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Convert a raw Mongo document into the shape callers expect:

    * `_id` becomes a string under the key `id`
    * the original `_id` key is dropped
    """
    if doc is None:
        return None
    out = dict(doc)
    raw_id = out.pop("_id", None)
    if raw_id is not None:
        out["id"] = str(raw_id)
    return out

def _now_utc() -> datetime:
    """Timezone-aware 'now' so timestamps round-trip cleanly through Mongo."""
    return datetime.now(timezone.utc)


def _to_object_id(entry_id: str) -> ObjectId:
    """Convert a string id to an ObjectId, raising a friendlier error if it's bad."""
    try:
        return ObjectId(entry_id)
    except (InvalidId, TypeError) as exc:
        raise ValueError(f"invalid entry id: {entry_id!r}") from exc




#Indexes

def create_indexes() -> None:
    """
    Create the indexes the app relies on. Safe to call repeatedly - pymongo
    skips indexes that already exist with the same spec.
    Call this once at startup.
    """
    db = get_database()
    journal = db[JOURNAL_ENTRIES]

    # Date range queries (newest-first listings, PDF date filters)
    journal.create_index([("event_datetime", DESCENDING)], name="event_datetime_desc")

    # Exact match filters used by search_journal_entries
    journal.create_index([("main_symptom", ASCENDING)], name="main_symptom_asc")
    journal.create_index([("pain_level", ASCENDING)], name="pain_level_asc")

    # Multikey indexes for `$in`-style filters on array fields
    journal.create_index([("triggers", ASCENDING)], name="triggers_multikey")
    journal.create_index([("tags", ASCENDING)], name="tags_multikey")

    journal.create_index([("created_at", DESCENDING)], name="created_at_desc")

    # Most queries also exclude soft-deleted rows; a partial index keeps that fast
    # without inflating the index for deleted docs.
    journal.create_index(
        [("event_datetime", DESCENDING)],
        name="event_datetime_active_only",
        partialFilterExpression={"deleted_at": None},
    )

    # PDF export records: list newest-first; allow filename lookup
    pdf_exports = db[PDF_EXPORTS]
    pdf_exports.create_index([("created_at", DESCENDING)], name="pdf_created_at_desc")
    pdf_exports.create_index([("filename", ASCENDING)], name="pdf_filename_asc")


def _coerce_entry(entry: Union[JournalEntry, Mapping[str, Any]]) -> JournalEntry:
    """Coerce a JournalEntry or a raw dict into a JournalEntry, validating the data."""
    if isinstance(entry, JournalEntry):
        return entry
    return JournalEntry.model_validate(entry)

def create_journal_entry(entry: Union[JournalEntry, Mapping[str, Any]]) -> Dict[str, Any]:
    """Create a new journal entry from the given data, returning the saved document."""
    model = _coerce_entry(entry)
    doc = model.model_dump(mode="python")

    # Snapshot current preferences if the caller didn't supply one, so changing
    # preferences later never reshapes this entry.
    if doc.get("preferences_snapshot") is None:
        prefs = get_preferences()
        doc["preferences_snapshot"] = prefs.to_snapshot().model_dump()

    now = _now_utc()
    doc["created_at"] = now
    doc["updated_at"] = now
    doc["deleted_at"] = None  # Soft delete field; null means "not deleted"

    result = get_database()[JOURNAL_ENTRIES].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_out(doc)  # type: ignore[return-value]

def get_journal_entry(entry_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single journal entry by its string id, or None if not found."""
    oid = _to_object_id(entry_id)
    doc = get_database()[JOURNAL_ENTRIES].find_one({"_id": oid, "deleted_at": None})
    return _doc_out(doc)

def list_journal_entries(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """List journal entries in reverse chronological order, with pagination."""
    cursor = (
        get_database()[JOURNAL_ENTRIES]
        .find({"deleted_at": None})
        .sort("event_datetime", DESCENDING)
        .skip(max(offset, 0))
        .limit(max(limit, 0))
    )
    return [_doc_out(doc) for doc in cursor]

def update_journal_entry(entry_id: str, updates: Mapping[str, Any]) -> Optional[Dict[str, Any]]:
    """Apply the given updates to the journal entry with the given id, returning the updated document."""
    oid = _to_object_id(entry_id)
    coll = get_database()[JOURNAL_ENTRIES]

    existing = coll.find_one({"_id": oid, "deleted_at": None})
    if existing is None:
        return None  # No such active entry

    # Fields callers are not allowed to overwrite via updates.
    forbidden = {"_id", "id", "created_at", "updated_at", "deleted_at", "preferences_snapshot"}
    safe_updates = {k: v for k, v in updates.items() if k not in forbidden}

    # Merge the safe updates onto the existing document.
    merged = dict(existing)
    merged.update(safe_updates)

    # Drop bookkeeping fields the JournalEntry model doesn't define, so
    # `extra="forbid"` validation doesn't reject the merged doc.
    for k in ("_id", "created_at", "updated_at", "deleted_at"):
        merged.pop(k, None)

    validated = JournalEntry.model_validate(merged)  # Raises if updates violate constraints.

    final = validated.model_dump(mode="python")
    final["updated_at"] = _now_utc()

    coll.update_one({"_id": oid}, {"$set": final})
    return get_journal_entry(entry_id)

def delete_journal_entry(entry_id: str) -> bool:
    """Soft-delete the journal entry with the given id. 
    Returns True if an entry was deleted, False if no such active entry exists."""
    oid = _to_object_id(entry_id)
    result = get_database()[JOURNAL_ENTRIES].update_one(
        {"_id": oid, "deleted_at": None},
        {"$set": {"deleted_at": _now_utc(), "updated_at": _now_utc()}},
    )
    return result.modified_count == 1

def hard_delete_journal_entry(entry_id: str) -> bool:
    """Permanently delete the journal entry with the given id. 
    Returns True if an entry was deleted, False if no such entry exists."""
    oid = _to_object_id(entry_id)
    result = get_database()[JOURNAL_ENTRIES].delete_one({"_id": oid})
    return result.deleted_count == 1


#Search

def search_journal_entries(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    main_symptom: Optional[str] = None,
    min_pain: Optional[int] = None,
    max_pain: Optional[int] = None,
    trigger: Optional[str] = None,
    tag: Optional[str] = None,
    limit: int = 200,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    """
 filter used by both the UI search bar and the PDF generator.

    Every argument is optional; passing none returns the same as
    `list_journal_entries`. Soft-deleted rows are always excluded.
    """
    query: Dict[str, Any] = {"deleted_at": None}

    # Date range on event_datetime. We accept either bound or both.
    if start_date is not None or end_date is not None:
        date_filter: Dict[str, datetime] = {}
        if start_date is not None:
            date_filter["$gte"] = start_date
        if end_date is not None:
            date_filter["$lte"] = end_date
        query["event_datetime"] = date_filter

    if main_symptom is not None:
        query["main_symptom"] = main_symptom

    if min_pain is not None or max_pain is not None:
        pain_filter: Dict[str, int] = {}
        if min_pain is not None:
            pain_filter["$gte"] = min_pain
        if max_pain is not None:
            pain_filter["$lte"] = max_pain
        query["pain_level"] = pain_filter

    if trigger is not None:
        # Multikey index lets Mongo treat "value in array" as a normal match.
        query["triggers"] = trigger

    if tag is not None:
        # Tags are stored lowercased; normalize the caller's input to match.
        query["tags"] = tag.strip().lower()

    cursor = (
        get_database()[JOURNAL_ENTRIES]
        .find(query)
        .sort("event_datetime", DESCENDING)
        .skip(max(offset, 0))
        .limit(max(limit, 0))
    )
    return [_doc_out(d) for d in cursor]  # type: ignore[misc]


#Preferences

def save_preferences(preferences: Union[UserPreferences, Mapping[str, Any]]) -> Dict[str, Any]:
    """
    Replace the single active preferences document. Called from the
    'Customize Modules' settings screen.

    NOTE: existing journal entries keep their embedded snapshot, so changing
    preferences here does NOT reshape old data.
    """
    model = preferences if isinstance(preferences, UserPreferences) else UserPreferences.model_validate(preferences)
    doc = model.model_dump(mode="python")
    doc["_id"] = ACTIVE_PREFS_ID
    doc["updated_at"] = _now_utc()

    get_database()[PREFERENCES].replace_one({"_id": ACTIVE_PREFS_ID}, doc, upsert=True)
    return _doc_out(doc)  # type: ignore[return-value]


def get_preferences() -> UserPreferences:
    """
    Return the active preferences as a validated model. If none exist yet,
    we return - and persist - the defaults so the rest of
    the app can rely on a doc being there.
    """
    raw = get_database()[PREFERENCES].find_one({"_id": ACTIVE_PREFS_ID})
    if raw is None:
        defaults = UserPreferences()
        save_preferences(defaults)
        return defaults

    # Strip the `_id` and `updated_at` keys the model doesn't know about.
    clean = {k: v for k, v in raw.items() if k not in {"_id", "updated_at"}}
    return UserPreferences.model_validate(clean)


def update_preferences(updates: Mapping[str, Any]) -> Dict[str, Any]:
    """
    Partial update for preferences (e.g. toggle a module or reorder).

    Loads current prefs, merges the given fields, re-validates through
    `UserPreferences`, and replaces the active doc. Returns the saved doc.
    """
    current = get_preferences().model_dump(mode="python")

    # Callers must not redefine bookkeeping fields.
    forbidden = {"_id", "id", "updated_at"}
    safe_updates = {k: v for k, v in updates.items() if k not in forbidden}

    merged = {**current, **safe_updates}
    return save_preferences(UserPreferences.model_validate(merged))


def reset_preferences() -> Dict[str, Any]:
    """Reset preferences to defaults (all known modules active, in default order)."""
    return save_preferences(UserPreferences())


#PDF export records

def _coerce_export(record: Union[PDFExportRecord, Mapping[str, Any]]) -> PDFExportRecord:
    """Coerce a PDFExportRecord or raw dict into a validated PDFExportRecord."""
    if isinstance(record, PDFExportRecord):
        return record
    return PDFExportRecord.model_validate(record)


def create_pdf_export_record(record: Union[PDFExportRecord, Mapping[str, Any]]) -> Dict[str, Any]:
    """Insert a new PDF export record and return the saved document."""
    model = _coerce_export(record)
    doc = model.model_dump(mode="python")
    doc["created_at"] = _now_utc()

    result = get_database()[PDF_EXPORTS].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_out(doc)  # type: ignore[return-value]


def get_pdf_export_record(record_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single PDF export record by its string id, or None if not found."""
    oid = _to_object_id(record_id)
    doc = get_database()[PDF_EXPORTS].find_one({"_id": oid})
    return _doc_out(doc)


def list_pdf_export_records(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """List PDF export records in reverse chronological order, with pagination."""
    cursor = (
        get_database()[PDF_EXPORTS]
        .find({})
        .sort("created_at", DESCENDING)
        .skip(max(offset, 0))
        .limit(max(limit, 0))
    )
    return [_doc_out(doc) for doc in cursor]  # type: ignore[misc]


def delete_pdf_export_record(record_id: str) -> bool:
    """Hard-delete the PDF export record. Returns True if a record was removed.

    Note: this only deletes the metadata doc - the PDF file itself (if any) must
    be removed separately by the caller.
    """
    oid = _to_object_id(record_id)
    result = get_database()[PDF_EXPORTS].delete_one({"_id": oid})
    return result.deleted_count == 1


#Local user profile

def get_user_profile() -> Optional[Dict[str, Any]]:
    """Fetch the single local user profile (or None if not set up yet)."""
    return _doc_out(get_database()[USER_PROFILE].find_one({"_id": LOCAL_USER_ID}))


def save_user_profile(profile: Mapping[str, Any]) -> Dict[str, Any]:
    """Upsert the single local user profile. No schema enforcement - keep it flexible."""
    doc = dict(profile)
    doc["_id"] = LOCAL_USER_ID
    doc["updated_at"] = _now_utc()
    get_database()[USER_PROFILE].replace_one({"_id": LOCAL_USER_ID}, doc, upsert=True)
    return _doc_out(doc)  # type: ignore[return-value]