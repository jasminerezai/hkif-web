# Backend Setup Guide

For the frontend team. This document covers everything you need to get the server running locally and start making requests from the client.

---

## Prerequisites

Before starting, make sure you have the following installed:

- **Node.js** v18 or higher
- **PostgreSQL** running locally (or a connection string to a hosted instance)
- **npm**

---

## Environment Variables

Inside the `server/` directory, create a `.env` file. There is no `.env.example` in the repo right now, so copy the block below exactly:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/hkif"
JWT_SECRET="any_long_random_string_here"
PORT=3001
CLIENT_URL=http://localhost:5173
```

Replace `<user>` and `<password>` with your local PostgreSQL credentials. The database name is `hkif` by convention (create it first if it doesn't exist):

```bash
psql -U postgres -c "CREATE DATABASE hkif;"
```

`CLIENT_URL` controls the CORS `origin` the server accepts. It defaults to `http://localhost:5173` (Vite's default port) if not set. If your frontend runs on a different port, set this accordingly or you'll get CORS errors on every request.

---

## Install and Run

```bash
# from the repo root
cd server
npm install
npm run dev
```

The dev server uses `tsx watch` so it hot-reloads on every file save. You do not need to restart it manually during development.

---

## Database Setup

Run these three commands **in order** the first time you set up locally. You only need to do this once (or again if you reset the database).

```bash
# 1. Apply the schema to your database
npx prisma migrate deploy

# 2. Generate the Prisma client (required before the server can start)
npx prisma generate

# 3. Seed the database with test data
npx prisma db seed
```

> **Important:** Run all three from inside the `server/` directory.

If `prisma generate` fails with a "generator not found" error, make sure you ran `npm install` first.

---

## Verifying the Server

Once the server is running, hit the health endpoint to confirm everything is working:

```
GET http://localhost:3001/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-05-11T14:09:50.137Z"
}
```

If you get a connection error, check that PostgreSQL is running and that your `DATABASE_URL` in `.env` is correct.

---

## Response Shapes

Every endpoint returns one of two shapes.

### Success

```json
{
  "status": "success",
  "data": { ... }
}
```

`data` holds the actual payload. Its shape varies per endpoint and is documented below.

### Error

```json
{
  "error": "Human-readable message here",
  "statusCode": 401
}
```

The HTTP status code and the `statusCode` field in the body will always match. You can use either to handle errors, but the body field is convenient when you want to avoid reading `res.status` in your fetch layer.

---

## Authentication

The server uses **JWT (JSON Web Tokens)**. Here is the full flow:

### Step 1 - Register or log in

Call `POST /api/auth/register` or `POST /api/auth/login`. Both return a token:

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "...",
      "email": "user1@example.com",
      "name": "User One",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

> **Note:** `name` is `string | null`. It will be `null` if the user registered without setting a profile name. Always guard against this in the UI (e.g. `user.name ?? 'Anonymous'`) rather than assuming it's always a string.

### Step 2 - Store the token

Save the token somewhere accessible in your app state (e.g. React Context, localStorage). The existing `AuthContext.jsx` in the client already handles this.

### Step 3 - Send the token with every protected request

Add it to the `Authorization` header:

```
Authorization: Bearer <your_token_here>
```

Example using `fetch`:

```js
const res = await fetch('http://localhost:3001/api/activities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ ... }),
});
```

### What happens if the token is missing or invalid?

The server returns a `401 Unauthorized`:

```json
{
  "error": "No token provided",
  "statusCode": 401
}
```

If the token is valid but the user's role is too low for that endpoint, you get a `403 Forbidden`:

```json
{
  "error": "Insufficient permissions",
  "statusCode": 403
}
```

### Role hierarchy

Roles are hierarchical. A higher role always has access to everything a lower role can do.

| Role | Level | Notes |
|------|-------|-------|
| `MEMBER` | 0 | Standard user |
| `LEADER` | 1 | Can manage their own activities |
| `BOARD_MEMBER` | 2 | Can manage any activity |
| `ADMIN` | 3 | Full access |

---

## Available Endpoints

Base URL: `http://localhost:3001`

### Health

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/health` | None | Server health check |

### Auth

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/register` | None | Create a new account |
| `POST` | `/api/auth/login` | None | Log in, receive a JWT token |
| `GET` | `/api/auth/me` | Token required | Get the currently logged-in user |

#### POST /api/auth/register

Request body:

```json
{
  "email": "newuser@example.com",
  "password": "yourpassword",
  "name": "Your Name"
}
```

#### POST /api/auth/login

Request body:

```json
{
  "email": "user1@example.com",
  "password": "user1pass"
}
```

#### GET /api/auth/me

No body required. Returns the user attached to the token.

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "...",
      "role": "ADMIN"
    }
  }
}
```

---

### Activities

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/activities` | None | List all activities with their time slots and leaders |
| `POST` | `/api/activities` | LEADER+ | Create a new activity |
| `PUT` | `/api/activities/:activityId` | LEADER+ | Update an existing activity |
| `DELETE` | `/api/activities/:activityId` | LEADER+ | Delete an activity |
| `PATCH` | `/api/activities/:activityId/schedules/:scheduleId/status` | LEADER+ | Update a schedule's status |

#### GET /api/activities

No auth required. Returns an array of all activities with their time slots and leaders included.

```json
{
  "status": "success",
  "data": [
    {
      "id": "...",
      "name": "Morning Yoga",
      "location": "Room A",
      "description": "...",
      "notes": null,
      "maxCapacity": 20,
      "defaultStatus": "ACTIVE",
      "timeSlots": [
        {
          "id": "...",
          "activityId": "...",
          "weekday": "MONDAY",
          "startTime": "1970-01-01T07:00:00.000Z",
          "endTime": "1970-01-01T08:00:00.000Z"
        }
      ],
      "leaders": [
        {
          "profileId": "...",
          "activityId": "..."
        }
      ]
    }
  ]
}
```

> Note on time slots: `startTime` and `endTime` are stored as `Date` objects anchored to `1970-01-01`. Only the time portion (`HH:MM`) is meaningful. Parse it with `new Date(slot.startTime).toISOString().slice(11, 16)` to get a clean `HH:MM` string.

#### POST /api/activities

Requires `LEADER` role or above. Request body:

```json
{
  "name": "Morning Yoga",
  "location": "Room A",
  "description": "Optional description",
  "notes": null,
  "maxCapacity": 20,
  "defaultStatus": "ACTIVE",
  "leaders": ["profile-id-1"],
  "timeSlots": [
    {
      "weekday": "MONDAY",
      "startAt": "07:00:00",
      "endAt": "08:00:00"
    }
  ]
}
```

- `leaders` is a required array of profile IDs. Pass an empty array `[]` and the server will automatically assign the requester as the only leader.
- `timeSlots` uses `startAt`/`endAt` as `HH:MM:SS` strings (seconds are required — `"07:00"` will be rejected).
- `description`, `notes`, `maxCapacity`, and `defaultStatus` are all optional.

Valid values for `weekday`: `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`

Valid values for `defaultStatus`: `ACTIVE`, `INACTIVE`, `CANCELLED`, `DELAYED`

#### PUT /api/activities/:activityId

Same shape as POST, but all fields are optional. Only the fields you include will be updated.

If you include `timeSlots`, the entire set of time slots for that activity is replaced (not merged). Send the full desired list.

If you include `leaders`, same behavior: the entire leaders list is replaced.

#### DELETE /api/activities/:activityId

No body required. Returns:

```json
{
  "status": "success",
  "data": null
}
```

#### PATCH /api/activities/:activityId/schedules/:scheduleId/status

Updates the status of a specific schedule occurrence (not the activity template itself). Useful for cancelling or delaying a single session.

Request body:

```json
{
  "status": "CANCELLED"
}
```

Valid status values: `ACTIVE`, `INACTIVE`, `CANCELLED`, `DELAYED`

Response includes a human-readable message:

```json
{
  "status": "success",
  "data": {
    "scheduleId": "...",
    "activityName": "Morning Yoga",
    "startAt": "2026-05-12T07:00:00.000Z",
    "endAt": "2026-05-12T08:00:00.000Z",
    "status": "CANCELLED",
    "message": "Schedule cancelled. Registered participants will see the cancellation on their next refresh."
  }
}
```

---

### Schedules

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/schedules/current` | None | Returns the current week's schedule (Monday to Sunday) |
| `GET` | `/api/schedules` | None | Get schedule by date (`?date=...&entireWeek=...`) or date range (`?startDate=...&endDate=...` or `?month=...`) |
| `GET` | `/api/schedules/range` | None | **(T16)** Get schedules for an entire date range or whole month in a single call |
| `POST` | `/api/schedules` | BOARD_MEMBER+ | Create a new schedule occurrence |
| `PUT` | `/api/schedules/:scheduleId` | LEADER+ | Update a schedule occurrence |
| `PATCH` | `/api/schedules/:scheduleId` | LEADER+ | Partially update a schedule occurrence |
| `DELETE` | `/api/schedules/:scheduleId` | BOARD_MEMBER+ | Delete a schedule occurrence |

#### GET /api/schedules/range (T16 - One call for a whole month)

Returns all scheduled activity sessions within a date range (inclusive), ordered chronologically. Designed specifically for monthly views or custom date ranges to eliminate multiple round-trips.

##### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` (or `from`, `start`) | `string` | Yes* | Start date in `YYYY-MM-DD` or ISO-8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) or `"today"`. Date-only values default to `00:00:00.000Z`. |
| `endDate` (or `to`, `end`) | `string` | Yes* | End date in `YYYY-MM-DD` or ISO-8601 or `"today"`. Date-only values automatically extend to `23:59:59.999Z` to include the entire day. |
| `month` | `string` | Optional* | Calendar month shortcut in `YYYY-MM` format (e.g. `2026-10`). Automatically queries from the 1st day `00:00:00.000Z` to the last day `23:59:59.999Z` of that month. |

*\* Either provide both `startDate` and `endDate` (or `from` & `to`), or provide `month`.*

##### Example 1: Entire calendar month (e.g. October 2026)
```
GET /api/schedules/range?month=2026-10
```
or
```
GET /api/schedules/range?startDate=2026-10-01&endDate=2026-10-31
```

##### Example 2: Month calendar grid (including leading/trailing days from adjacent months)
```
GET /api/schedules/range?startDate=2026-09-28&endDate=2026-11-01
```

##### Response `(200 OK)`:
```json
{
  "status": "success",
  "data": [
    {
      "id": "e30e15b6-79cf-4fd3-9d47-65dae0caeb76",
      "activityId": "912dbb8f-124b-4cbe-8c7c-9b16858e7223",
      "startAt": "2026-10-06T17:00:00.000Z",
      "endAt": "2026-10-06T18:30:00.000Z",
      "status": "ACTIVE",
      "createdAt": "2026-10-01T12:00:00.000Z",
      "updatedAt": "2026-10-01T12:00:00.000Z",
      "activity": {
        "id": "912dbb8f-124b-4cbe-8c7c-9b16858e7223",
        "name": "Badminton",
        "description": "Weekly casual badminton",
        "location": "Gym Hall 2",
        "maxCapacity": 20,
        "defaultStatus": "ACTIVE",
        "notes": "Bring your own racket"
      },
      "leaders": [
        {
          "id": "42610ff9-219e-4a62-9d7a-12e2cbfbe4aa",
          "profileName": "Sarah Connor"
        }
      ],
      "participantCount": 7
    }
  ]
}
```

##### Error Responses:
- `400 Bad Request`: When required parameters are missing or invalid:
```json
{
  "error": "Both startDate and endDate are required",
  "statusCode": 400
}
```
or
```json
{
  "error": "startDate must be before or equal to endDate",
  "statusCode": 400
}
```

#### GET /api/schedules/current
Returns all sessions for the current ISO week (Monday to Sunday).

#### GET /api/schedules
Flexible collection endpoint supporting:
- Date range: `GET /api/schedules?startDate=2026-10-01&endDate=2026-10-31` or `GET /api/schedules?month=2026-10`
- Specific week: `GET /api/schedules?date=2026-10-15` (defaults to entire week)
- Single day: `GET /api/schedules?date=2026-10-15&entireWeek=false`

## Seeded Test Accounts

After running `npx prisma db seed`, the following accounts are available:

| Email | Password | Role |
|-------|----------|------|
| `user1@example.com` | `user1pass` | ADMIN |
| `user2@example.com` | `user2pass` | LEADER |
| `user3@example.com` | `user3pass` | LEADER |
| `user4@example.com` | `user4pass` | LEADER |
| `user5@example.com` | `user5pass` | LEADER |
| `user6@example.com` | `user6pass` | MEMBER |
| `user7@example.com` | `user7pass` | MEMBER |
| ... | ... | MEMBER |

Use `user1` for full admin access during development. Use `user2` through `user5` to test leader-restricted endpoints.

---

> Questions or something broken? Let me know on Discord.
