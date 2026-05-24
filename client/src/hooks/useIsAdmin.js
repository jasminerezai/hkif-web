// useIsAdmin — single source of truth for "is the current user
// an ADMIN?".
//
// Why a hook instead of inline checks:
//   We had `user?.role === ROLES.ADMIN` duplicated in ProfilePage
//   and (conceptually) StatisticsPage. Two places means two places
//   to update if we ever change how ADMIN is identified — e.g. if
//   we widen access to "ADMIN or SUPER_ADMIN" later, or move to a
//   permission-flag model rather than a role string. Centralising
//   in a hook means one edit instead of grepping the codebase.
//
// USAGE:
//   const isAdmin = useIsAdmin()
//   if (isAdmin) { ... }
//
// Returns false (not undefined) when there's no user, so callers
// can use it directly in conditional rendering without optional
// chaining clutter.
//
// Related role helpers live next to this file — if you need a
// "useCanManage()" hook later for MANAGER_ROLES, follow the same
// pattern.

import { useAuth } from '../context/AuthContext.jsx'
import { ROLES } from '../constants/roles.js'

export function useIsAdmin() {
  const { user } = useAuth()
  return user?.role === ROLES.ADMIN
}