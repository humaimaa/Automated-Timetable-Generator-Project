# Automatic Timetable Generator

A full-stack web application for managing academic resources and generating weekly timetables. The Django REST API manages batches, sections, subjects, teachers, and classrooms, while a genetic algorithm generates optimized timetables for the frontend to display and export.

## Features

- Manage batches, sections, subjects, teachers, and classrooms.
- Configure subject frequency, teacher availability, and teaching capacity.
- Generate timetables for individual batches or all batches.
- View timetables by section or teacher.
- Export timetables in HTML, CSV, Excel, and PDF formats.

## Tech Stack

| Component | Technologies |
|---|---|
| Backend | Python, Django, Django REST Framework, SQLite |
| Scheduling | Genetic Algorithm |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Exports | OpenPyXL, ReportLab |

## Project Layout

```text
.
├── manage.py                 # Django management entry point
├── projttgs/                 # Django project configuration
├── ttgen/                    # API, data models, scheduling, and exports
├── templates/                # Django templates
└── timetableupgrade/         # Next.js frontend
    ├── app/                  # App Router pages and styles
    ├── components/           # UI and timetable components
    └── services/             # Frontend API client
```

## Requirements

- Python 3.10 or later
- Node.js 20 or later
- npm

## Run locally

Start the backend and frontend in separate terminals from the repository root.

### 1. Backend Setup (Django REST API)

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

The backend will be available at:

- API: http://127.0.0.1:8000/api/
- Django Admin: http://127.0.0.1:8000/admin/

### 2. Frontend Setup (Next.js)

Open a new terminal:

```bash
cd timetableupgrade
npm ci
npm run dev
```

Open the application at:

http://localhost:3001

By default, the frontend connects to `http://localhost:8000/api`.

To configure a different backend URL, create a `timetableupgrade/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Restart the frontend after changing environment variables.

## API Routes

The REST API is available at `http://127.0.0.1:8000/api/`.

| Resource | Endpoint |
|---|---|
| Batches | `/api/batches/` |
| Sections | `/api/sections/` |
| Subjects | `/api/subjects/` |
| Teachers | `/api/teachers/` |
| Classrooms | `/api/classrooms/` |
| Timetable Entries | `/api/timetable/` |

### Timetable Operations

- `POST /api/timetable/generate/` — Generate a timetable for a specific batch using `batch_id`.
- `POST /api/timetable/generate_all/` — Generate timetables for all batches.
- Filter timetable data using `section_id` or `teacher_id`.
- Access HTML, CSV, Excel, and PDF export endpoints.

## Development

Apply database migrations:

```bash
python manage.py migrate
```

Run backend tests:

```bash
python manage.py test
```

Build the frontend:

```bash
cd timetableupgrade
npm run build
```

## Deployment Notes

The included Django settings are intended for local development.

Before deploying to production:

- Configure a secure, private `DJANGO_SECRET_KEY`.
- Set `DEBUG=False`.
- Configure `ALLOWED_HOSTS` and CORS settings.
- Use a production-ready database and web server.


