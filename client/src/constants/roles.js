// Single source of truth for ProfileRole values on the frontend.
// Must stay in sync with the ProfileRole enum on the backend
// (server/prisma/schema.prisma).
//
// Why this file exists:
//   Before this we were checking ['LEADER', 'BOARD_MEMBER', 'ADMIN']
//   inline in components. That meant a typo (e.g. 'LEADERS') would
//   silently fail and never trigger a lint or compile error.
//   Centralizing keeps role names typo-proof and easy to update.
// ─────────────────────────────────────────────────────────────

export const ROLES = {
  MEMBER:       'MEMBER',
  LEADER:       'LEADER',
  BOARD_MEMBER: 'BOARD_MEMBER',
  ADMIN:        'ADMIN',
}

// Roles allowed to create, edit, and manage activities.
// Used by ProtectedRoute on the /activities/new and /activities/:id/edit routes.
// Backend enforces this independently via role middleware — this is the
// frontend gate that stops the page from mounting at all.
export const MANAGER_ROLES = [
  ROLES.LEADER,
  ROLES.BOARD_MEMBER,
  ROLES.ADMIN,
]