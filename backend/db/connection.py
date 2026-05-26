"""
Last edit: Ryder Gilman May 24th 


* `MONGO_URI`     - where MongoDB is running (default: mongodb://localhost:27017)
* `MONGO_DB`      - logical DB name        (default: healthdiary)
* `MONGO_TEST_DB` - DB name used by pytest (default: healthdiary_test)

Values to be loaded on docker container 

"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

from pymongo import MongoClient
from pymongo.database import Database



# Module-level singletons. They stay None until `connect_to_mongo()` runs.
_client: Optional[MongoClient] = None
_db: Optional[Database] = None


def _env(name: str, default: str) -> str:
    """Read an environment variable with a default. Trivial wrapper for readability."""
    return os.environ.get(name, default)


def connect_to_mongo(uri: Optional[str] = None, db_name: Optional[str] = None) -> Database:
    """
    Open a connection to MongoDB and return the chosen Database.
    """
    global _client, _db

    uri = uri or _env("MONGO_URI", "mongodb://localhost:27017")
    db_name = db_name or _env("MONGO_DB", "healthdiary")

    # If we already have a client pointed at the right URI, reuse it.
    if _client is None:
        # `serverSelectionTimeoutMS` keeps "is the DB up?" failures fast (3s)
        # instead of the default 30 second hang. UTC datetimes everywhere.
        _client = MongoClient(
            uri,
            serverSelectionTimeoutMS=3000,
            tz_aware=True,
        )

    _db = _client[db_name]
    return _db


def get_database() -> Database:
    """
    Return the active Database, opening a connection lazily on first call.
    """
    if _db is None:
        return connect_to_mongo()
    return _db


def close_connection() -> None:
    """Close the cached client """
    global _client, _db
    if _client is not None:
        _client.close()
    _client = None
    _db = None


def ping() -> bool:
    """
    Returns True if MongoDB
    answers the `ping` admin command, raises the underlying pymongo error
    otherwise so failures are loud.
    """
    db = get_database()
    db.command("ping")
    return True
