# HKIF Database Schema

**Schema name:** `firstSchema`  
**Database:** PostgreSQL  
**Last updated:** 2026-04-23

---

## Tables

### `profile`
Stores user account information. Core authentication and identity table.

| Column      | Type                  | Constraints       | Description                          |
|-------------|-----------------------|-------------------|--------------------------------------|
| `profileId` | `serial`              | PRIMARY KEY       | Auto-incremented unique user ID      |
| `email`     | `character varying(255)` | NOT NULL, UNIQUE | User email address                   |
| `password`  | `text`                | NOT NULL          | Hashed password (bcrypt)             |
| `role`      | `character varying(30)` | NOT NULL        | e.g. `student`, `admin`, `leader`    |

---

### `template_activity`
Defines reusable activity templates (e.g. "Volleyball", "Football"). Acts as the master catalog of sports/activities offered by HKIF.

| Column           | Type                      | Constraints  | Description                              |
|------------------|---------------------------|--------------|------------------------------------------|
| `activityId`     | `serial`                  | PRIMARY KEY  | Auto-incremented activity ID             |
| `name`           | `character varying(255)`  | NOT NULL     | Activity name (e.g. "Volleyball", "Football")  |
| `description`    | `character varying(255)`  |              | Short description of the activity        |
| `location`       | `character varying(30)`   |              | Where the activity takes place           |
| `time`           | `json`                    |              | Default time info (days/hours as JSON)   |
| `leader`         | `character varying`       |              | Name or ID of the responsible leader     |
| `default_status` | `character varying`       |              | Default status when scheduling           |

---

### `schedule`
Represents a specific scheduled occurrence of an activity on a given date. Generated from `template_activity`.

| Column        | Type                           | Constraints              | Description                                      |
|---------------|--------------------------------|--------------------------|--------------------------------------------------|
| `activity`    | `character varying`            | PRIMARY KEY, FK → `template_activity.activityId` | Links to the activity template |
| `week_nr`     | `bigint`                       |                          | Week number of the year                          |
| `date`        | `date`                         | PRIMARY KEY              | Specific date of the session                     |
| `status`      | `bigint`                       |                          | Status code (e.g. active, cancelled)             |
| `time`        | `time without time zone`       |                          | Start time of the session                        |
| `last_change` | `timestamp without time zone`  |                          | Last time this record was modified               |

---

### `favorites`
Junction table — stores which activities a user has favorited.

| Column       | Type     | Constraints                              |
|--------------|----------|------------------------------------------|
| `profileId`  | `bigint` | PRIMARY KEY, FK → `profile.profileId`    |
| `activityId` | `bigint` | PRIMARY KEY, FK → `template_activity.activityId` |

---

### `participationLog`
Tracks user participation and interest in scheduled activities.

| Column              | Type      | Constraints                              | Description                                      |
|---------------------|-----------|------------------------------------------|--------------------------------------------------|
| `activityId`        | `bigint`  | PRIMARY KEY, FK → `schedule.activity`    | The scheduled activity session                   |
| `date`              | `date`    | PRIMARY KEY, FK → `schedule.date`        | Date of the session                              |
| `profileId`         | `bigint`  | PRIMARY KEY, FK → `profile.profileId`    | The user                                         |
| `expressedInterest` | `boolean` |                                          | Whether the user expressed interest beforehand   |
| `participated`      | `boolean` |                                          | Whether the user actually attended               |

---

## Relationships

- `template_activity` → `schedule`: One activity template can have many scheduled sessions (1:N)
- `template_activity` → `favorites`: One activity can be favorited by many users (via junction table)
- `profile` → `favorites`: One user can favorite many activities (via junction table)
- `schedule` → `participationLog`: One scheduled session can have many participation records (1:N)
- `profile` → `participationLog`: One user can have many participation records (1:N)

---

## Notes

- Passwords must be stored **hashed** using bcrypt — never plain text
- `role` in `profile` should be validated at the application layer (allowed values: `student`, `admin`, `leader`)
- add `name` or (`first_name` and `last_name`) field on profile