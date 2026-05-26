"""Repository for database operations.
Last edit Ryder Gilman May 25th

This module defines the data models for entries and provides functions to interact with the MongoDB database. 
It uses the `pydantic` library for data validation and serialization. 

This module containS all logic related to data storage and retrieval, 
so that the rest of the application can interact only with this module. 

TODO: CRUD JOURNAL ENTRY STUFF 

"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Mapping, Optional, Union

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ASCENDING, DESCENDING
from pymongo.database import Database

from .connection import get_database
from .models import (
    JournalEntry,
    PDFExportRecord,
    PreferencesSnapshot,
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

    # Date range queries (newest-first listings, PDF date filters).
    journal.create_index([("event_datetime", DESCENDING)], name="event_datetime_desc")

    # Exact match filters used by search_journal_entries.
    journal.create_index([("main_symptom", ASCENDING)], name="main_symptom_asc")
    journal.create_index([("pain_level", ASCENDING)], name="pain_level_asc")

    # Multikey indexes for `$in`-style filters on array fields.
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


#TODO: CRUD Journal entries, 
#TODO: CRUD User preferences,
#TODO: Search / filter journal 
# TODO: Create Seed data script to populate db with examples for testing. 



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