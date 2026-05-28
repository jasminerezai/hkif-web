<p align="center">
  <img src="./client/public/logo.jpg" alt="Project Logo" width="200"/>
</p>

<h1 align="center">HKIF Web Application ᯓ🏃🏻‍♀️‍➡️ᯓ⚽️</h1>

<p align="center">
  <a href="https://hkif-web.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live-Demo-green?style=for-the-badge" />
  </a>
</p>

No more digging through Instagram to find out when volleyball is on.

HKIF is a **sports activity platform** built for students at Kristianstad University as part of the Fullstack Development course. The platform makes it easier to discover sports activities, view schedules, and stay updated on cancellations or delays.

## The Problem

Sports activities at HKR are currently announced mainly through Instagram, which creates several issues:

- No structured weekly schedule
- No simple way to track cancellations or delays
- No centralized platform to view all activities

HKIF solves this by providing a **single organized platform** for sports activities and updates.

## Features

-  Browse sports activities and weekly/monthly schedules
-  View real-time status updates (active, delayed, cancelled)
-  Role-based access control for members, leaders, board members, and admins
-  Admin can edit and create new activities
-  Leaders can manage their own activities
-  Designed for future integration with HKR’s official website

## Tech Stack

### Frontend
- React
- React Router (routing)
- Vite
- bcryptjs
- JavaScript

### Backend
- Express.js
- TypeScript
- Zod-Input Validation

### Database
- PostgreSQL
- Prisma ORM

### Authentication
- JWT (JSON Web Tokens)

## Project Structure

```txt
hkif-web/
├── client/                 # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   ├── .env.example
│   └── vite.config.js
│
├── server/                 # Backend API (Express + TypeScript)
│   ├── prisma/
│   ├── src/
│   ├── prisma.config.ts
│   └── tsconfig.json
│
├── docs/                   # Documentation
│   ├── backend/
│   ├── database/
│   └── api-spec.md
│
├── LICENSE
└── README.md
```

## Running Locally

### 0. Installing PostgreSQL server
[Install the PostgreSQL Installer (Official Download Site)](https://www.postgresql.org/download/)
1. Download the installer for your Operating System
2. Follow the instructions of the Installer to install the *PostgreSQL Server*, only the server is required.
    1. Note down the username and password during Setup.
3. Add the *bin* directory to the PATH environmental variable
4. Open the terminal:
    1. `psql -U <username>`
    2. enter your password
    3. run `CREATE DATABASE hkif` (or name the DB some other name)

### 1. Clone the Repository

```bash
git clone https://github.com/jasminerezai/hkif-web.git
cd hkif-web
````

### 2. Create `server/.env`

- for the `DATABASE_URL` enter username, password, and DB name.
- *Tip for `JWT_SECRET`:* use a password generator

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/hkif"
JWT_SECRET="your_long_random_secret"
PORT=3001
CLIENT_URL="http://localhost:5173"
```

### 3. Backend Setup & First-Time Prisma Setup

```bash
cd server
npm install
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
npm run dev
```

- `npm install` --> installs required packages
- `npx prisma migrate deploy` --> deploys the DB-schema from *schema.prisma* onto the created database server.
- `npx prisma generate` --> generates boilerplate code (queries and typescript types) from the schema
- `npx prisma db seed` --> seeds the database with mock data
- `npm run dev` --> starts the backend development server

### 4. Frontend Setup
Run the commands below to install the required packages and start the frontend server.
```bash
cd client
npm install
npm run dev
```

The frontend runs at:

```txt
http://localhost:5173
```
Visit this url in the browser.

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
- Weekly & Monthly schedules
- Role-based authentication and authorization
- Activity management for leaders
- Participation tracking
- Favorite activities
- Improved mobile responsiveness

### Planned Features
- Notifications and reminders

## Contributors

| Role | Contributors |
|------|---------------|
| **Fullstack** | <a href="https://github.com/jasminerezai">jasminerezai</a> |
| **Backend** | <a href="https://github.com/gunnarwrld">gunnarwrld</a>, <a href="https://github.com/JuriRappold">JuriRappold</a> |
| **Frontend** | <a href="https://github.com/larrymijo">larrymijo</a>, <a href="https://github.com/isaqelle">isaqelle</a> |


## Vision

The long-term goal of HKIF is to become the official platform for student sports activities at Kristianstad University, making it easier for students to stay active and connected.


