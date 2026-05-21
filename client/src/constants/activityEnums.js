// Single source of truth for activity-related enum values on the frontend.
// Must stay in sync with the ActivityStatus and Weekday enums on the
// backend (server/prisma/schema.prisma).
//
// Why this file exists:
//   Currently only ActivityFormPage uses these lists, but the values are
//   also referenced by the schedule/list pages when rendering slot data,
//   and any new page that builds a status/weekday picker will need the
//   same arrays. Centralising now stops the lists silently drifting from
//   the schema when a new value is added (e.g. POSTPONED).
//
// The backend validates status/weekday server-side, so a missing value
// here is a UX gap (option not selectable) not a data integrity issue.
// Future improvement: when we set up a shared client/server types
// package, these should move there.
// ─────────────────────────────────────────────────────────────

export const ACTIVITY_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'CANCELLED',
  'DELAYED',
]

export const WEEKDAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]