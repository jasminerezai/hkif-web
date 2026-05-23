// All API calls for fetching activities that an ADMIN or BOARD_MEMBER
// can manage live here. ProfilePage (Manage Activities section) imports
// these — nothing else should call them directly.
//
// Why a separate service instead of reusing the inline fetch in
// ActivitiesPage:
//   - ProfilePage is opening a *management* view, not a browse view.
//     Keeping the call behind a named function documents intent and
//     gives us one place to swap in a scoped endpoint later (e.g. when
//     LEADER's "my activities" ticket lands and we need filtering by
//     ownership).
//   - Matches the FavoritesService / ProfileService pattern already
//     used in the project — pages call services, services own fetch().

import { API_BASE_URL } from './apiConfig.js'

const BASE = `${API_BASE_URL}/api/activities`

// ── fetchManageableActivities ─────────────────────────────────
// GET /api/activities
//
// Returns the full JSON body: { status, data: [...activities] }
// Callers should destructure `.data` (same convention as fetchProfile
// and fetchFavorites).
//
// Auth note:
//   This endpoint is currently PUBLIC on the backend
//   (see server/src/routes/activities.routes.ts → router.get('', ...))
//   so no Authorization header is sent. For ADMIN / BOARD_MEMBER the
//   "manageable" set is just every activity in the system, so the
//   public list is exactly what we want — we don't need to filter
//   client-side.
//
//   No AuthExpiredError handling for the same reason: the endpoint
//   doesn't read the token, so it can't reject one. If we later add a
//   protected /api/users/me/managed-activities endpoint, plumb the
//   token + 401 check in here the same way FavoritesService does it.
export async function fetchManageableActivities() {

  const response = await fetch(BASE)

  if (!response.ok) {
    throw new Error('Failed to fetch manageable activities')
  }

  return response.json()
}