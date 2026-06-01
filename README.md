# HealthDiary
 
A locally hosted web application for logging and tracking chronic health condition flare-ups. Designed for people who want a low-friction, event-based alternative to daily check-in apps — log when something happens, with as much or as little detail as you choose.
 
Built for CS 422 (Software Methodologies) at the University of Oregon, Spring 2026.  
**Authors:** Ryder Gilman, Dennis Hulett, Kaegan Koski, Rowan Moore

## What It Does
 
HealthDiary lets you:
 
- **Log health events** with optional fields for pain level (1–10), mood (1–10), functional impact, body location, medications taken, triggers, and free-form notes
- **Define custom symptom ratings** (e.g. "Brain Fog: 7/10") that persist across entries
- **Browse past entries** via a calendar view or paginated log list
- **Edit or delete past entries** at any time
- **Customize your tracking modules** so only the fields you care about appear at log time
- **Export a PDF health report** for sharing with healthcare professionals — concise, one-page, self-reported summary with medication table, pain levels, and triggers
All data is stored locally in a MongoDB database. Nothing leaves your machine.
 
## Prerequisites
 
You need [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed. Verify with:
 
docker --version
 
If the command isn't found, install Docker Desktop for your OS from the link above before continuing.
 
## Installation & Running
 
### Start the app
 
From the project root directory run:
 
make docker-up
 
This builds and starts all four containers (backend, frontend, MongoDB, Mongo Express). First build may take up to a minute. Once running, open your browser and go to: http://127.0.0.1:5173/

### Stop the app

make docker-down

Your data is saved between sessions automatically via the Docker image. You can safely stop and restart without losing entries.
 
### Port conflict on 5173?
 
If the app doesn't load, port 5173 may be in use. Stop HealthDiary first, then:
 
**Mac / Linux:**
lsof -i :5173
kill <PID>

 
**Windows:**
netstat -ano | findstr :5173
taskkill /PID <PID> /F

 
Then relaunch with `make docker-up`.

