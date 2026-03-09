# MonetIA API (Django)

This folder contains the Django backend for MonetIA.

## Requirements

- Python 3.11+

## Setup (Windows PowerShell)

1. Create and activate a virtualenv

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies

```powershell
pip install -r requirements.txt
```

3. Create a `.env` file next to this README (see `.env.example`)

```powershell
Copy-Item .env.example .env
```

4. Run migrations and start the server

```powershell
python .\src\manage.py migrate
python .\src\manage.py runserver 8000
```

## Default endpoints

- `GET /api/health/` -> `{ "status": "ok" }`
- `GET /admin/`

## API v1 (mock responses for now)

- `GET /api/v1/projects/`
- `GET /api/v1/alerts/`
- `GET /api/v1/recommendations/`

## Next.js example

```ts
const res = await fetch("http://localhost:8000/api/v1/projects/");
const json = await res.json();
console.log(json.results);
```

## Notes

- The Django project lives under `apps/api/src/`.
- The default settings module is `config.settings.dev`.
