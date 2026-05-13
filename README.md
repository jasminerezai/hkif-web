# HKIF Web Application ᯓ🏃🏻‍♀️‍➡️ᯓ⚽️

No more digging through Instagram to find out when volleyball is on.

HKIF is a sports activity platform built for students at Kristianstad University, making it easier to discover sports activities, view schedules, and stay updated on cancellations or delays.

## The Problem

Sports activities at HKR are currently announced mainly through Instagram, which creates several issues:

- No structured weekly schedule
- No simple way to track cancellations or delays
- No centralized platform to view all activities

HKIF solves this by providing a single organized platform for sports activities and updates.

## Features

-  Browse sports activities and weekly schedules
-  View real-time status updates (active, delayed, cancelled)
-  Role-based access control for members, leaders, board members, and admins
-  Leaders can create and manage their own activities
-  Designed for future integration with HKR’s official website

## Tech Stack

### Frontend
- React
- React Router (routing)
- Vite
- bcryptjs

### Backend
- Express.js
- TypeScript

### Database
- PostgreSQL
- Prisma ORM

### Authentication
- JWT (JSON Web Tokens)

## Running Locally

### 1. Clone the Repository

```bash
git clone https://github.com/jasminerezai/hkif-web.git
cd hkif-web
````

### Create `server/.env`

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/hkif"
JWT_SECRET="your_long_random_secret"
PORT=3001
CLIENT_URL="http://localhost:5173"
```

### Backend Setup

```bash
cd server
npm install
npm run dev
```

### First-Time Prisma Setup

```bash
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend runs at:

```txt
http://localhost:5173
```

## Test Accounts

| Role   | Email             | Password  |
|--------|-------------------|-----------|
| ADMIN  | user1@example.com | user1pass |
| LEADER | user2@example.com | user2pass |
| MEMBER | user6@example.com | user6pass |

## Project Status

HKIF is currently in active development.

### Completed

- Activity browsing
- Weekly schedules
- Role-based authentication and authorization
- Activity management for leaders

### Planned Features

- Participation tracking
- Favorite activities
- Notifications and reminders
- Improved mobile responsiveness

## Vision

The long-term goal of HKIF is to become the official platform for student sports activities at Kristianstad University, making it easier for students to stay active and connected.
