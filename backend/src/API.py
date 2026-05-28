"""

"""
from flask import Flask, request, jsonify
from pymongo import MongoClient
import os
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev'

mongo_host = os.environ.get('DB_HOST', 'db')
client = MongoClient(mongo_host, 27017)
db = client.healthdiary

"""
@app.route("/")
@app.route("/index")
def home():
    return jsonify({"status": "ok"})
"""

def generate_id():

    id = 0

    return id

@app.route("/api/store_user_log")
def store_user_log():

    
    
    return jsonify({"message": "entry added to database"})

@app.route("/api/fetch_user_log")
def fetch_user_log():

    ##return dummy values
    base_dir = os.path.dirname(os.path.abspath(__file__))  # points to src/
    file_path = os.path.join(base_dir, '..', 'db', 'example_data', 'journal_entry.example.json')

    with open(file_path) as f:
        data = json.load(f)
    return jsonify(data)

@app.route("/api/get_user_prefs")
def get_user_prefs():

    ##return dummy values
    base_dir = os.path.dirname(os.path.abspath(__file__))  # points to src/
    file_path = os.path.join(base_dir, '..', 'db', 'example_data', 'preferences.eexample.json')

    with open(file_path) as f:
        data = json.load(f)
    return jsonify(data)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)