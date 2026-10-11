# Service Request Dashboard: Web Development Technical Assignment

*Debugging • API connection • Testing • Free deployment*

You have been given a small, existing web application that **contains intentional bugs**. Your job is to
investigate the problems, fix them, verify the application, and deploy a working version to a publicly
accessible URL using a free hosting tier.

**Time limit: 2–3 days.** If the codebase is unfamiliar or your environment is hard to set up, tell the
interviewer early (24 hours), Deadline to submit the code 15 october 12:00 pm. You may use documentation and search. Be prepared to explain every line you submit.

---

## 1. Scenario

The app is a simple *Service Request* dashboard. A visitor should be able to:

- load the page and see a list of service requests from the API,
- submit a new request through a form,
- see a clear success or error message,
- use the page comfortably on both desktop and mobile.

## 2. Your tasks

### Stage 1: Identify and reproduce the bugs (required)
- Run the project locally and document each issue you can reproduce.
- Use browser DevTools (Console, Network tab) and the backend / deployment logs.
- Explain the likely root cause and the **evidence** that supports it, before or while fixing it.

### Stage 2: Fix the issues (required)
- Make targeted fixes. Do not rewrite the whole application.
- Make the frontend-to-API connection work. Loading, empty, success and error states should all behave sensibly.
- Form input must be validated, with understandable messages instead of silent failures.
- Never put API keys, passwords or other secrets in client-side code.

### Stage 3: Test and deploy (required)
- Test the main flow from page load through a successful form submission.
- Test at least one failure case (for example an unavailable API or a rejected request).
- Check for regressions, and check the layout at mobile and desktop widths.
- Provide a short test checklist with pass/fail for each item.
- Deploy to a free tier. See [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md). A static host alone cannot run the Python API.
- Verify the public URL in a fresh browser session and document any free-tier limitations.

## 3. What to submit

1. A Git repository link with your changes and a clear README.
2. The public deployed URL and brief deployment steps.
3. Your **test checklist** and results, plus screenshots or a short screen recording of the working site.
4. A short note on what you would improve next with more time.

A fill-in template is provided in [`docs/SUBMISSION_TEMPLATE.md`](docs/SUBMISSION_TEMPLATE.md).

## 4. Rules

- Keep your work in Git commits so a reviewer can follow what changed.
- Do not commit secrets or real customer data. Use sample data only.
- Do not modify any live business website or production database for this assessment.
- Do not add paid services or incur charges. If a free deployment is blocked by an account or platform
  restriction, document the blocker, include evidence, and describe a clear deployment plan.

## 5. Acceptance criteria

- The deployed site loads over HTTPS and its main page renders without uncaught browser errors.
- The request list loads from the intended API, or clearly explains a failure.
- A valid form submission works and shows a visible confirmation.
- Invalid input is handled safely and clearly.
- API/network failures never produce a blank page or a misleading success message.
- You can explain the root cause of each bug and demonstrate the fix.
- The README lets another developer run the project and understand how it was deployed.

---

## Tech stack

| Part | Technology |
| --- | --- |
| Frontend | React 18 + Vite, JavaScript, CSS |
| Backend | Python 3 + FastAPI (Pydantic validation) |
| Data | A local JSON file with an in-memory fallback (no database needed) |

## Prerequisites

- **Python 3.10+** (3.12 recommended)
- **Node.js 18+** with npm
- Git

## Run it locally

Open two terminals from the project root.

**Terminal 1: Python API (http://127.0.0.1:8000)**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```

Check it is up: <http://127.0.0.1:8000/api/health> (interactive docs at <http://127.0.0.1:8000/docs>).

**Terminal 2: React app (http://localhost:5173)**

```bash
cd frontend
npm install
npm run dev
```

During development the Vite dev server forwards `/api/*` requests to the Python API on port 8000.

### Backend tests

```bash
cd backend
pytest
```

### Building and previewing a production bundle

`npm run build` creates an optimised bundle in `frontend/dist/`, and `npm run preview` serves it on
<http://localhost:4173>. Unlike `npm run dev`, a production bundle is static files only. In a real deployment
the API lives on a **different origin** than the frontend, so to approximate that locally, run the API on
another port that allows the preview origin:

```bash
# Terminal 1 (stop any other API instance first)
cd backend
CORS_ORIGINS=http://localhost:4173 uvicorn app.main:app --port 8080
#   PowerShell:  $env:CORS_ORIGINS="http://localhost:4173"; uvicorn app.main:app --port 8080

# Terminal 2
cd frontend
VITE_API_BASE_URL=http://127.0.0.1:8080 npm run build
#   PowerShell:  $env:VITE_API_BASE_URL="http://127.0.0.1:8080"; npm run build
npm run preview
```

## Project structure

```text
.
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, routes, error handlers, CORS
│   │   ├── schemas.py       # Pydantic request/response models and validation
│   │   ├── storage.py       # JSON-file store with in-memory fallback
│   │   ├── config.py        # Environment-based settings
│   │   └── seed_data.json   # Sample data
│   ├── tests/test_api.py
│   ├── pytest.ini
│   ├── requirements.txt
│   └── requirements-dev.txt
├── frontend/
│   ├── src/
│   │   ├── api/             # fetch wrapper + service-request API functions
│   │   ├── components/      # RequestForm, RequestList, HealthBadge
│   │   ├── hooks/           # useServiceRequests
│   │   ├── utils/           # validation, formatting, payload mapping
│   │   ├── config.js
│   │   ├── App.jsx
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── SUBMISSION_TEMPLATE.md
└── README.md
```

## Configuration

| Where | Variable | Purpose | Default |
| --- | --- | --- | --- |
| Backend | `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API (no trailing slash) | `http://localhost:5173,http://127.0.0.1:5173` |
| Backend | `DATA_FILE` | Path of the JSON data file | `data/requests.json` |
| Frontend | `VITE_API_BASE_URL` | API base URL for deployed builds (see `frontend/.env.example`) | empty |

Never commit real secrets. `.env` files are git-ignored; only `*.example` files are tracked. This project
needs no secrets.

## API

See [`docs/API.md`](docs/API.md). In short: `GET /api/health`, `GET /api/requests`, `POST /api/requests`.

## About data persistence

Requests are stored in `backend/data/requests.json` (created on first run). Many free hosts use an
**ephemeral filesystem**, so on those platforms the file is wiped whenever the service restarts, redeploys or
spins down, and the three sample requests reappear. That is expected for this assignment; mention it in your
submission rather than treating it as a bug.
