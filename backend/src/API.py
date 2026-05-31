"""

"""
from flask import Flask, request, jsonify
from pydantic import ValidationError

# Imports db API.py ran from src and not backend.
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import os
import json
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from db.repository import (search_journal_entries, 
                           get_preferences,  
                           create_journal_entry, update_preferences
)


app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev'

from db.connection import get_database
db = get_database()
try:
    from db.repository import create_indexes
    create_indexes()
except Exception as e:
    print(f"Error creating indexes: {e}")


"""
@app.route("/")
@app.route("/index")
def home():
    return jsonify({"status": "ok"})
"""



@app.route("/api/store_user_log", methods=["POST"])
def store_user_log():
    data = request.get_json(silent=True) or {}
    payload = {
        "main_symptom": data.get("main_symptom", "none"),
        "event_datetime": data.get("event_datetime"),
        "pain_level": data.get("pain_level"),
        "mood": data.get("mood"),
        "functional_impact": data.get("functional_impact"),
        "medications": data.get("medications", []),
        "triggers": data.get("triggers", []),
        "notes": data.get("notes"),
        "body_locations": data.get("body_locations", []),
        "current_treatment": data.get("current_treatment"),
        "custom_ratings": data.get("custom_ratings", []),
        "tags": data.get("tags", []),
    }

    # Frontend sends datetimes as "dd/mm/yyyy HH:MM"; Pydantic only accepts
    # ISO-8601, so convert here before validation.
    try:
        payload["event_datetime"] = datetime.strptime(
            payload["event_datetime"], "%d/%m/%Y %H:%M"
        )
        for med in payload["medications"]:
            if med.get("time_taken"):
                med["time_taken"] = datetime.strptime(
                    med["time_taken"], "%d/%m/%Y %H:%M"
                )
    except (ValueError, TypeError):
        return jsonify({"error": "invalid datetime format, expected dd/mm/yyyy HH:MM"}), 400

    try:
        saved = create_journal_entry(payload)
    except (ValueError, ValidationError) as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify({"message": "entry added to database", "id": saved["id"]}), 201

@app.route("/api/fetch_user_log/<string:id>")
def fetch_user_log(id):
    try:
        entry = db.journal_entries.find_one({"_id": ObjectId(id), "deleted_at": None})
    except Exception:
        return jsonify({"error": "invalid id format"}), 400

    if entry is None:
        return jsonify({"error": "entry not found"}), 404

    entry["_id"] = str(entry["_id"])
    entry["event_datetime"] = entry["event_datetime"].isoformat()
    entry["created_at"] = entry["created_at"].isoformat()
    entry["updated_at"] = entry["updated_at"].isoformat()

    return jsonify(entry)

@app.route("/api/set_user_prefs", methods=["POST"])
def set_user_prefs():
    body = request.get_json(silent=True) or {}
    updates = {k: body[k] for k in ("active_modules", "module_order") if body.get(k) is not None}
    try:
        saved = update_preferences(updates)
    except (ValueError, ValidationError) as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify({"message": "preferences set", "preferences": saved})

@app.route("/api/get_user_prefs")
def get_user_prefs():

    prefs = db.preferences.find_one({"_id": "active"})

    if prefs is None:
        return jsonify({"error": "no preferences found"}), 404

    prefs["updated_at"] = prefs["updated_at"].isoformat()

    return jsonify(prefs)

@app.route("/api/userlogs/<int:number>/<int:offset>")
def userlogs(number, offset):
    entries = db.journal_entries.find(
        {"deleted_at": None}, #Setting this to none ensures deleted entries aren't returned. 
        sort=[("event_datetime", -1)],
        skip=offset,
        limit=number
    )

    result = []
    for entry in entries:
        entry["_id"] = str(entry["_id"])
        entry["event_datetime"] = entry["event_datetime"].isoformat()
        entry["created_at"] = entry["created_at"].isoformat()
        entry["updated_at"] = entry["updated_at"].isoformat()
        result.append(entry)

    total = db.journal_entries.count_documents({"deleted_at": None})
    return jsonify({"total": total, "entries": result})

@app.route("/api/calendar/<int:year>/<int:month>")
@app.route("/api/calendar/<int:year>/<int:month>/<int:day>")
def calendar(year, month, day=None):

    start_date = datetime(year, month, 1)

    if day is not None:
        start_date = datetime(year, month, day)
        end_date = start_date + timedelta(days=1)
    elif month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)

    entries = db.journal_entries.find({
        "event_datetime": {
            "$gte": start_date,
            "$lt": end_date
        }
    })

    result = []
    for entry in entries:
        entry["_id"] = str(entry["_id"])
        entry["event_datetime"] = entry["event_datetime"].isoformat()
        entry["created_at"] = entry["created_at"].isoformat()
        entry["updated_at"] = entry["updated_at"].isoformat()
        result.append(entry)

    return jsonify(result)

@app.route("/api/graph_info")
def graph_info():

    

    return jsonify({"message": "not implemented yet"})

@app.route("/api/number_entries")
def number_entries():

    entry_num = db.journal_entries.count_documents({})

    return jsonify({"entries": entry_num})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
