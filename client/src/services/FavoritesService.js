// All API calls for the user's favorite activities live here.
// ActivitiesPage imports these — nothing else should call them directly.
 
import { API_BASE_URL } from './apiConfig.js'
 
// All favorites routes are scoped under /api/users/me/favorites.
// Defining BASE once keeps the calls below short and consistent
// with the pattern in AuthService.js.
const BASE = `${API_BASE_URL}/api/users/me/favorites`
 
// ── fetchFavorites ────────────────────────────────────────────
// GET /api/users/me/favorites
// Returns the full JSON body: { status, data: [...activities] }
// Protected — must send Bearer token.
export async function fetchFavorites(token) {
 
  const response = await fetch(BASE, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
 
  if (!response.ok) {
    throw new Error('Failed to fetch favorites')
  }
 
  return response.json()
}
 
// ── addFavorite ───────────────────────────────────────────────
// POST /api/users/me/favorites/:activityId
// No response body needed — we just want to know it succeeded.
export async function addFavorite(activityId, token) {
 
  const response = await fetch(`${BASE}/${activityId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
 
  if (!response.ok) {
    throw new Error('Failed to add favorite')
  }
}
 
// ── removeFavorite ────────────────────────────────────────────
// DELETE /api/users/me/favorites/:activityId
export async function removeFavorite(activityId, token) {
 
  const response = await fetch(`${BASE}/${activityId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
 
  if (!response.ok) {
    throw new Error('Failed to remove favorite')
  }
}