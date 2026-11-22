# Automatic Timetable Generator Web App

## Overview
This project is a fullstack web application for automatic timetable generation using a Genetic Algorithm. It features:
- **Backend:** Django (Python) with SQLite, REST API, and GA-based scheduler
- **Frontend:** React.js (Vite) for timetable display, export, and admin controls

## Features
- Generate weekly timetables for 15 sections (A1, A2, ..., E7)
- Admin input for subjects, teachers, classrooms, constraints
- Genetic Algorithm for optimal scheduling
- Export timetables as HTML, CSV, or PDF

## Project Structure
- `/backend/` — Django project and app
- `/frontend/` — React app (Vite)

## Setup
### Backend
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (Windows)
4. `pip install -r requirements.txt` (to be created)
5. `python manage.py migrate`
6. `python manage.py runserver`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Usage
- Use the web UI to generate and view timetables
- Export as HTML, CSV, or PDF

---
