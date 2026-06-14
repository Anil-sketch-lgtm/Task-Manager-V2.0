# API Documentation

## Authentication (`/api/auth`)
- `POST /register`: Accepts `name`, `email`, `password`. Returns `{ id, name, email, token }`.
- `POST /login`: Accepts `email`, `password`. Returns `{ token }`.

## Tasks (`/api/tasks`) *(Requires Bearer Token)*
- `GET /`: Retrieves all tasks for the authenticated user.
- `GET /prioritized`: Fetches all pending tasks, routes them to the ML Service, and returns the mathematically ranked list.
- `GET /:id`: Retrieves a single task.
- `POST /`: Creates a new task. Accepts `title`, `description`, `deadline`, `priority`.
- `PUT /:id`: Updates an existing task (e.g., status updates).
- `DELETE /:id`: Deletes a task.

## Focus Mode (`/api/focus`) *(Requires Bearer Token)*
- `POST /`: Logs a completed Pomodoro session. Accepts `startTime`, `endTime`, `interruptions`.

## ML Service (`/ml`) *(Internal - Port 8000)*
- `POST /ml/prioritize`: Accepts a list of raw tasks. Returns them ordered by calculated urgency scores based on priority weighting and deadline proximity.
