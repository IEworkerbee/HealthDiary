"""

"""
from flask import Flask, request, jsonify
from pymongo import MongoClient
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev'

"""
@app.route("/")
@app.route("/index")
def home():
    return jsonify({"status": "ok"})
"""

@app.route("/api/store_user_log")
def store_user_log():
    
    return jsonify({"status": "ok"})

@app.route("/api/fetch_user_log")
def fetch_user_log():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)