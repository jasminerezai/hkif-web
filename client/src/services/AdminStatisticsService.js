// All API calls for the admin statistics dashboard live here.
// StatisticsPage imports these — nothing else should call them directly.
//
// Why a dedicated service file:
//   Matches the FavoritesService / ProfileService / ManageActivitiesService
//   pattern already used elsewhere — pages call named service functions,
//   services own fetch() and error translation. Keeps page components
//   declarative and easy to read in code review.

import { API_BASE_URL } from './apiConfig.js'
import { AuthExpiredError } from './AuthExpiredError.js'
// AuthExpiredError signals "the JWT got rejected" specifically —
// the page can react with logout + redirect to /login instead of
// treating it like any other API failure.

const BASE = `${API_BASE_URL}/api/admin/statistics`

// ── fetchAdminStatistics ──────────────────────────────────────
// GET /api/admin/statistics
//
// Returns the full JSON body:
//   {
//     status: 'success',
//     data: {
//       totalParticipantsPerActivity: [{ activityId, activityName, participantCount }],
//       mostPopularActivities:        [{ activityId, activityName, participantCount, favoriteCount }],
//       cancellationRates: {
//         overallRate, totalSchedules, cancelledSchedules,
//         perActivity: [{ activityId, activityName, totalSchedules, cancelledSchedules, cancellationRate }]
//       }
//     }
//   }
//
// Auth note:
//   Endpoint is gated server-side via restrictToMinRole(ADMIN).
//   A non-ADMIN token will return 403, not 401 — we surface that
//   as a generic error rather than AuthExpiredError because the
//   token is still valid, the user just doesn't have permission.
//   In practice the frontend route gate (App.jsx) prevents anyone
//   except ADMIN from reaching this code path at all.
export async function fetchAdminStatistics(token) {

  const response = await fetch(BASE, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  // 401 = JWT expired/invalid → tear down the session.
  // Checked BEFORE the generic !response.ok so the page can
  // route into logout + redirect via useAuthExpiredHandler.
  if (response.status === 401) {
    throw new AuthExpiredError()
  }

  if (!response.ok) {
    throw new Error('Failed to fetch admin statistics')
  }

  return response.json()
}