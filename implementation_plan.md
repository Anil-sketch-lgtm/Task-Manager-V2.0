# Smart Task Prioritizer - Implementation Plan

The goal is to develop a multi-layered web application for intelligent task prioritization, featuring an Angular frontend, a Node.js/Express backend, a SQLite/PostgreSQL database, and a Python ML service.

## User Review Required

> [!IMPORTANT]
> - **Database choice for local dev:** I propose using **SQLite** with the **Prisma ORM** for the initial development phase to minimize setup complexity. Prisma allows an easy transition to PostgreSQL later. Are you okay with starting with SQLite?
> - **Monorepo vs. Multi-repo:** I propose setting this up as a single monorepo (or simply subdirectories within `e:\Task_Manager` for each service) to make it easier to manage all parts of the application together.

## Proposed Architecture Setup

The project will be structured into three main directories within `e:\Task_Manager`:
- `frontend/` - Angular application
- `backend/` - Node.js/Express API
- `ml-service/` - Python FastAPI service

### Phase 1: Project Initialization & Scaffold

1.  **Backend (`backend/`)**
    - Initialize Node.js project (`package.json`).
    - Setup TypeScript, Express, and essential middleware (cors, dotenv, helmet).
    - Setup Prisma ORM with SQLite.
    - Setup basic folder structure (controllers, routes, services, models).

2.  **ML Service (`ml-service/`)**
    - Initialize Python environment (venv).
    - Install FastAPI, Uvicorn, scikit-learn, pandas.
    - Create a basic FastAPI application with a placeholder `/ml/prioritize` endpoint.

3.  **Frontend (`frontend/`)**
    - Generate a new Angular workspace using Angular CLI.
    - Install Angular Material.
    - Create basic module structure (Auth, Dashboard, Focus, Analytics).

### Phase 2: Database schema & Core Backend API

1.  **Database Models (Prisma)**
    - `User`: id, name, email, password_hash
    - `Task`: id, user_id, title, description, deadline, priority, status
    - `FocusSession`: id, user_id, start_time, end_time, interruptions
    - `UserBehavior`: id, user_id, task_id, completion_time, delay_factor

2.  **Auth Implementation**
    - Registration & Login endpoints.
    - JWT generation and verification middleware.

3.  **Task Management API**
    - CRUD endpoints for tasks (`/api/tasks`).
    - Integration of task prioritization logic calling the ML service.

### Phase 3: Python ML Service Development

1.  **Prioritization Endpoint**
    - Implement `/ml/prioritize` accepting a list of tasks and user history.
    - Develop a basic heuristic or a simple scikit-learn model (e.g., Logistic Regression or Decision Tree) to score and rank tasks based on urgency, deadline, and past delay factors.
    - Return a sorted list of task IDs with scores.

### Phase 4: Frontend Development

1.  **Authentication UI**
    - Login and Signup pages.
    - Auth guard for protected routes.

2.  **Dashboard & Task Management**
    - Task list view (Today, Upcoming, Completed).
    - Create/Edit task forms.
    - "Recommended Order" view fetching prioritized tasks from the backend.

3.  **Focus Mode**
    - Pomodoro-style timer component.
    - Integration with backend to log `FocusSession` data.

### Phase 5: Polish & Documentation

- Swagger/OpenAPI documentation setup for the Node.js backend.
- UI refinements using Angular Material and custom CSS.
- Final end-to-end testing.

## Verification Plan

### Automated/Local Testing
- Run backend unit tests (if configured).
- Test backend APIs using Swagger UI.
- Test ML service endpoint locally via Swagger UI (FastAPI provides this out-of-the-box).

### Manual Verification
- Start all three services locally (Angular dev server, Node.js server, Uvicorn server).
- Register a new user, create several tasks with varying deadlines and priorities.
- Request the "Recommended Order" and ensure the ML service processes and returns a valid ranking.
- Run a Focus Mode session and verify it logs to the database correctly.
