"""

"""
from flask import Flask, request, jsonify
from pymongo import MongoClient
import os
import json
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import db.repository 


app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev'

mongo_host = os.environ.get('MONGO_URI', 'db')
client = MongoClient(mongo_host, 27017)
db = client.healthdiary

"""
@app.route("/")
@app.route("/index")
def home():
    return jsonify({"status": "ok"})
"""

def get_preferences():
    pass

@app.route("/api/store_user_log", methods = ["POST"])
def store_user_log():

    data = request.get_json()

    date = datetime.strptime(data.get("event_datetime", ""), '%d/%m/%Y %H:%M')
    main_symptom = data.get("main_symptom", "none")
    pain_level = int(data.get("pain_level", "-1"))
    mood = int(data.get("mood", "-1"))
    functional_impact = data.get("functional_impact", None)
    notes = data.get("notes", None)
    current_treatment = data.get("current_treatment", None)

    medications = data.get("medications", [])       # list of dicts
    for medication in medications:
        if ("time_taken" in medication): medication.time_taken = datetime.strptime(medication.time_taken, '%d/%m/%Y %H:%M') # Grabbing time from here too  
    
    triggers = data.get("triggers", [])             # list of strings
    tags = data.get("tags", [])
    body_locations = data.get("body_locations", [])
    custom_ratings = data.get("custom_ratings", [])
    preferences_snapshot = get_preferences()

    created_at = datetime.now(timezone.utc)

    final = {
        "main_symptom": main_symptom,
        "event_datetime": date,
        "pain_level": pain_level,
        "mood": mood,
        "functional_impact": functional_impact,
        "medications" : medications,
        "triggers" : triggers,
        "notes" : notes,
        "body_locations" : body_locations, 
        "current_treatment" : current_treatment,
        "custom_ratings" : custom_ratings,
        "tags" : tags,
        "preferences_snapshot" : preferences_snapshot,
        "created_at" : created_at,
        "updated_at" : created_at
    }

    db.journal_entries.insert_one(final)
    
    return jsonify({"message": "entry added to database"})

@app.route("/api/fetch_user_log/<string:id>")
def fetch_user_log(id):
    try:
        entry = db.journal_entries.find_one({"_id": ObjectId(id)})
    except Exception:
        return jsonify({"error": "invalid id format"}), 400

    if entry is None:
        return jsonify({"error": "entry not found"}), 404

    entry["_id"] = str(entry["_id"])
    entry["event_datetime"] = entry["event_datetime"].isoformat()
    entry["created_at"] = entry["created_at"].isoformat()
    entry["updated_at"] = entry["updated_at"].isoformat()

    return jsonify(entry)

@app.route("/api/set_user_prefs", methods = ["POST"])
def set_user_prefs():

    body = request.get_json()
    active_modules = body.get("active_modules", None)
    module_order = body.get("module_order", None)

    # Load existing prefs so we don't overwrite unrelated fields
    existing = db.preferences.find_one({"_id": "active"}) or {}

    prefs = {
        "_id": "active",
        "active_modules": active_modules if active_modules is not None else existing.get("active_modules", []),
        "module_order": module_order if module_order is not None else existing.get("module_order", []),
        "snapshot_version": existing.get("snapshot_version", 1),
        "updated_at": datetime.now(timezone.utc)
    }

    db.preferences.replace_one({"_id": "active"}, prefs, upsert=True)

    return jsonify({"message": "preferences set"})

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
        {},
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

    total = db.journal_entries.count_documents({})
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

    

    return jsonify({"message": "preferences set"})

@app.route("/api/number_entries")
def number_entries():

    entry_num = db.journal_entries.count_documents({})

    return jsonify({"entries": entry_num})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
