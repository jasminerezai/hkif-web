// Single source of truth for ProfileRole values on the frontend.
// Must stay in sync with the ProfileRole enum on the backend
// (server/prisma/schema.prisma).
//
// Why this file exists:
//   Before this we were checking ['LEADER', 'BOARD_MEMBER', 'ADMIN']
//   inline in components. A typo (e.g. 'LEADERS') would silently fail
//   with no lint or compile error. Centralising keeps role names
//   typo-proof and easy to update in one place.
// ─────────────────────────────────────────────────────────────

export const ROLES = {
  MEMBER:       'MEMBER',
  LEADER:       'LEADER',
  BOARD_MEMBER: 'BOARD_MEMBER',
  ADMIN:        'ADMIN',
}

// Two role groups, mirroring the backend's permission model:
//
// MANAGER_ROLES — can CREATE activities (and do anything an editor can).
//   Used on /activities/new. Backend POST /api/activities is gated to
//   BOARD_MEMBER+, so LEADER is deliberately NOT in this list — a LEADER
//   loading the create form would just get a 403 from the API on submit,
//   which is bad UX.
//
// EDITOR_ROLES — can OPEN the edit form for an existing activity.
//   Used on /activities/:id/edit. LEADERs are allowed because the backend
//   PUT /api/activities/:id permits a LEADER to update activities they're
//   assigned to. The own-activity check is enforced server-side via
//   assertActivityAccess — we do not duplicate that logic here.
//
// Backend role middleware is the real enforcement layer. These arrays
// are the frontend gate that stops the page from mounting client-side,
// so we avoid pointless fetches and dead-end "no permission" screens.
export const MANAGER_ROLES = [
  ROLES.BOARD_MEMBER,
  ROLES.ADMIN,
]

export const EDITOR_ROLES = [
  ROLES.LEADER,
  ROLES.BOARD_MEMBER,
  ROLES.ADMIN,
]