# Aegis — Cloud Security Center

Centralized cloud security dashboard: security events, EC2 inventory, compliance posture, infrastructure topology, resource monitoring, IAM, incidents, logs, and reports — in one full-screen app with global Dark/Light theming.

> Monorepo: `frontend/` (React + Vite + Tailwind) · `backend/` (FastAPI + SQLAlchemy + Postgres) · `docker-compose.yml` (Postgres).

---

## 1. Features

| Area | What you get |
|---|---|
| **Dashboard** | Stat cards (secure resources, active threats, compliance score, open incidents), CPU chart (Recharts), security events feed, compliance donut + failing rules, EC2 instances table, quick actions, service status row |
| **Infrastructure** | Account summary, network summary, interactive topology graph (`@xyflow/react`), resource inventory, details panel, security posture findings |
| **Monitoring** | Metrics overview, CPU/memory + network charts, resource health, alerts feed, recent activity |
| **Security** | Findings browser with severity filters, bulk actions, detail drawer |
| **IAM** | Users/roles table, MFA + access-key hygiene indicators |
| **Incidents** | Incident queue with status workflow, detail view |
| **Logs** | Searchable log stream with severity/source filters |
| **Compliance** | Framework progress, failing rules table |
| **Reports / Settings** | Report shortcuts, environment + notification preferences |
| **Theming** | Global Dark (default) / Light mode, Sun/Moon toggle in TopBar, persisted in `localStorage` (`aegis-theme`), theme-aware sidebar logo, FOUC-free pre-paint script |

---

## 2. Tech stack

**Frontend** (`frontend/`): React 18.3 + Vite 5 + Tailwind CSS 3.4, `recharts` 2.x, `@xyflow/react` 12.x, `lucide-react`, Inter font.

**Backend** (`backend/`): FastAPI (`app/main.py`, title `"Aegis API"`), SQLAlchemy models (`Instance`, `SecurityEvent`, `ComplianceRule`, `Alert`), Pydantic schemas, Postgres.

**Infra**: Postgres 16 via Docker Compose (`aegis-postgres`, external volume `aegis_postgres_data`). Dev: frontend `:5173`, API `:8000`.

---

## 3. Repository structure

```
.
├── README.md                        # you are here
├── .env                             # Postgres credentials (single source of truth)
├── docker-compose.yml               # Postgres service
├── aegis-logo-dark (1).svg          # master Aegis dark logo asset
├── aegis-logo-light (1).svg         # master Aegis light logo asset
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py                  # FastAPI app + /api/* routes
│       ├── models.py                # Instance, SecurityEvent, ComplianceRule, Alert
│       ├── schemas.py               # Pydantic schemas
│       └── database.py              # engine / SessionLocal / Base
└── frontend/
    ├── index.html                   # title + pre-paint theme script (no FOUC)
    ├── vite.config.js               # dev server :5173, open:true
    ├── tailwind.config.js           # base.* ↔ CSS vars, status.* palette, Inter
    ├── public/
    │   ├── aegis-logo-dark.svg      # served at /aegis-logo-dark.svg
    │   └── aegis-logo-light.svg     # served at /aegis-logo-light.svg
    └── src/
        ├── main.jsx                 # React entry
        ├── App.jsx                  # h-screen shell: Sidebar + TopBar + state-based page router
        ├── index.css                # theme tokens, logo swap, Recharts + ReactFlow overrides
        ├── data/                    # mockData, infrastructureData, monitoringMockData, pagesData
        ├── services/api.js          # fetch layer (API_URL http://127.0.0.1:8000) + mock fallbacks
        ├── store/                   # securityCenter.js, transitions.js, actionTypes.js
        ├── utils/refreshBus.js
        └── components/
            ├── Sidebar.jsx          # brand logo + nav + environment + user card
            ├── TopBar.jsx           # search + theme toggle (Sun/Moon) + notifications + Admin User
            ├── DashboardHeader.jsx / StatsRow.jsx / StatCard.jsx / RadialPercent.jsx
            ├── CpuChart.jsx / SecurityEvents.jsx / ComplianceOverview.jsx
            ├── InstancesTable.jsx / QuickActions.jsx / ServiceStatusRow.jsx
            ├── infrastructure/      # InfrastructurePage + topology + inventory + details
            ├── monitoring/          # MonitoringPage + charts + health + alerts
            └── pages/               # Security, Iam, Logs, Incidents, Compliance, Reports, Settings (+ ui.jsx)
```

---

## 4. Quickstart

### Prerequisites

- Node.js 18+ and npm · Python 3.11+ · Docker + Docker Compose

### A. Database (Docker)

```bash
docker compose up -d
docker compose ps
```

Defaults come from the root `.env`:

```ini
POSTGRES_USER=aegis
POSTGRES_PASSWORD=aegis_password
POSTGRES_DB=aegis_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

Compose reuses the external volume `aegis_postgres_data` so data survives restarts.

### B. Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Verify: `GET /` → `{"message": "Aegis API is running"}` · `GET /api/health/db` → `{"database": "connected"}` · docs at `/docs`.

### C. Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`).

```bash

---

## 5. API reference

Base URL: `http://127.0.0.1:8000` (see `frontend/src/services/api.js` → `API_URL`).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Liveness probe |
| `GET` | `/api/health/db` | Postgres connectivity check |
| `GET` / `POST` | `/api/events` | List / create security events |
| `GET` / `POST` | `/api/instances` | List / create EC2 instances |
| `GET` / `POST` | `/api/alerts` | List / create alerts |
| `GET` / `POST` | `/api/compliance` | List / create compliance rules |

CORS allows `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:5176`.

> **Mock vs. live:** the app ships with rich mocks in `frontend/src/data/`. `services/api.js` already calls live endpoints for events/instances/alerts, while infrastructure + monitoring resolve from local mock modules (each has a `TODO` showing the exact `fetch` to swap in when `GET /api/infrastructure` and `GET /api/monitoring/...` land).

---

## 6. Theming (Dark / Light)

Principle: **Dark is the default; Light is opt-in.** No component hardcodes a theme — everything flows through CSS variables + the `html.light` class.

- **Tokens** (`frontend/src/index.css` `:root`): `--aegis-bg #09121F`, `--aegis-panel #0E1A2B`, `--aegis-panel2 #101D30`, `--aegis-border #1B2839` (RGB channels so Tailwind opacity modifiers keep working).
- **Tailwind bridge** (`tailwind.config.js`): `bg-base-bg`, `bg-base-panel`, `bg-base-panel2`, `border-base-border`, plus fixed `status.*` accents (green `#22C55E`, red `#EF4444`, amber `#F59E0B`, purple `#A855F7`, blue `#3B82F6`) constant across themes for contrast.
- **Light overrides**: the `html.light …` block in `index.css` remaps tokens (`#f9fafb` bg, `#ffffff` cards, `#1f2937`/`#4b5563` text, `#e5e7eb` borders) and adjusts slate/gray utilities, Recharts fills, and React Flow canvas — every current *and future* page inherits the theme automatically.
- **Toggle + persistence**: Sun/Moon button in `TopBar.jsx` next to "Admin User" flips `document.documentElement.classList` and writes `localStorage['aegis-theme']`.
- **No flash**: `index.html` has a pre-paint script applying `html.light` before first render when stored.
- **Logo swap**: `Sidebar.jsx` renders both `public/aegis-logo-dark.svg` and `public/aegis-logo-light.svg` (`h-11 w-auto object-contain`); CSS shows exactly one per theme. Master artwork: repo-root `aegis-logo-dark (1).svg` / `aegis-logo-light (1).svg` (366×98).

**New page?** Just use `bg-base-*` / `border-base-border` (and `status.*` for severity) — it respects the active theme with zero extra config.

---

## 7. Layout contract

`App.jsx` is a fixed-viewport shell (`h-screen w-screen overflow-hidden`): `Sidebar` (fixed `w-60`) + `TopBar` + scroll-free page grid. Page switching is state-based (`activeItem`, via `store/securityCenter.js` → `setupNavigation`). Best at 1440×900+; smaller viewports compress instead of scrolling.

---

## 8. Configuration

| File | Purpose |
|---|---|
| `.env` (root) | `POSTGRES_USER / PASSWORD / DB / HOST / PORT` for Compose + FastAPI |
| `docker-compose.yml` | Postgres 16, `5432:5432`, `pg_isready` healthcheck |
| `frontend/vite.config.js` | Dev port `5173`, auto-open |
| `frontend/src/services/api.js` | `API_URL` — point at your deployed API off localhost |

---

## 9. Troubleshooting

| Symptom | Fix |
|---|---|
| Blank page / API errors | Start backend (`uvicorn … :8000`), confirm `/api/health/db` → `connected` |
| DB connection refused | `docker compose up -d`; check `.env` vs running container |
| Port `5173` busy | Stop other Vite instance or change `server.port` |
| Theme flashes on reload | Keep the pre-paint script in `index.html`; don't clear `aegis-theme` |
| Logo 404 | Ensure both SVGs exist in `frontend/public/` (copied to `dist/` on build) |
| Layout squeezed | Use ≥1440×900 — the shell avoids page scroll by design |

---

## 10. Scripts cheat-sheet

```bash
docker compose up -d                                        # postgres
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000  # backend/ API
npm install && npm run dev                                  # frontend/ dev :5173
npm run build                                               # frontend/ → dist/
npm run preview                                             # preview dist/
```

---

Built as the **Aegis Cloud Security Center** — one shell, every security surface, dark-first with a first-class light mode.

npm run build    # production bundle → frontend/dist/
npm run preview  # serve the production build locally
```

