# HKIF REST API Specification

This document provides a concise reference for all public and authenticated API endpoints exposed by the HKIF backend server (`http://localhost:3001` or deployed environment).

For setup instructions and development guides, refer to [backend-setup.md](file:///Users/gunnarwrld/proyects/hkif-web/docs/backend/backend-setup.md).

---

## Response Envelope

All API endpoints return JSON conforming to the following structure:

### Success (`200 OK`, `201 Created`)
```json
{
  "status": "success",
  "data": { ... } // Or array [ ... ]
}
```

### Error (`400`, `401`, `403`, `404`, `500`)
```json
{
  "error": "Human-readable error message",
  "statusCode": 400
}
```

---

## 1. Health

- **`GET /api/health`**
  - **Auth**: None
  - **Description**: Verifies backend health and DB connectivity status.

---

## 2. Authentication

- **`POST /api/auth/register`**
  - **Auth**: None
  - **Body**: `{ "email": "...", "password": "...", "name": "..." }`
  - **Returns**: `{ "user": { ... }, "token": "..." }`

- **`POST /api/auth/login`**
  - **Auth**: None
  - **Body**: `{ "email": "...", "password": "..." }`
  - **Returns**: `{ "user": { ... }, "token": "..." }`

- **`GET /api/auth/me`**
  - **Auth**: Bearer token
  - **Returns**: Profile information of the authenticated user.

---

## 3. Activities

- **`GET /api/activities`**
  - **Auth**: None
  - **Query**: `?leaderId=<uuid>` (optional)
  - **Returns**: List of all activity templates including time slots and leaders.

- **`GET /api/activities/:activityId`**
  - **Auth**: None
  - **Returns**: Activity details by ID.

- **`POST /api/activities`**
  - **Auth**: `LEADER` role or higher
  - **Body**: Activity template fields (`name`, `location`, `timeSlots`, `leaders`, etc.)

- **`PUT /api/activities/:activityId`**
  - **Auth**: `LEADER` role or higher
  - **Body**: Fields to update.

- **`DELETE /api/activities/:activityId`**
  - **Auth**: `LEADER` role or higher
  - **Returns**: Null data on successful deletion.

---

## 4. Schedules (Sessions)

- **`GET /api/schedules/current`**
  - **Auth**: None
  - **Description**: Returns all sessions for the current ISO week (Monday through Sunday).
  - **Returns**: `ScheduleDto[]`

- **`GET /api/schedules/range`** *(T16 - Date Range / Month View)*
  - **Auth**: None
  - **Description**: Returns all scheduled sessions within an arbitrary date range or entire calendar month in a single request.
  - **Query Parameters**:
    - `startDate` (or `from`, `start`): Start date (`YYYY-MM-DD` or ISO-8601).
    - `endDate` (or `to`, `end`): End date (`YYYY-MM-DD` or ISO-8601).
    - `month`: Month shortcut in `YYYY-MM` format (e.g. `2026-10`).
  - **Returns**: `ScheduleDto[]` ordered chronologically.

- **`GET /api/schedules`**
  - **Auth**: None
  - **Description**: Flexible query endpoint supporting:
    - Date range: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` or `?month=YYYY-MM`
    - Specific week: `?date=YYYY-MM-DD&entireWeek=true`
    - Single day: `?date=YYYY-MM-DD&entireWeek=false`
  - **Returns**: `ScheduleDto[]`

- **`POST /api/schedules`**
  - **Auth**: `BOARD_MEMBER` role or higher
  - **Body**: `{ "activityId": "<uuid>", "startAt": "<ISO>", "endAt": "<ISO>", "status": "ACTIVE" }`

- **`PUT /api/schedules/:scheduleId`** / **`PATCH /api/schedules/:scheduleId`**
  - **Auth**: `LEADER` role or higher
  - **Body**: `{ "startAt": "<ISO>", "endAt": "<ISO>", "status": "<STATUS>" }`

- **`DELETE /api/schedules/:scheduleId`**
  - **Auth**: `BOARD_MEMBER` role or higher

- **`PATCH /api/activities/:activityId/schedules/:scheduleId/status`**
  - **Auth**: `LEADER` role or higher
  - **Body**: `{ "status": "CANCELLED" | "DELAYED" | "ACTIVE" | "INACTIVE" }`
