// All API calls for registering / unregistering a user
// from a specific schedule live here.
//
// SchedulePage imports these — nothing else should call them directly.
// Pattern mirrors FavoritesService.js so the codebase stays consistent.

import { API_BASE_URL } from './apiConfig.js'

// The participate endpoints are scoped under
// /api/activities/:activityId/schedules/:scheduleId/participate
//
// We build the path inside each function rather than a single BASE
// constant because both IDs are dynamic per call.

// ── registerParticipation ─────────────────────────────────────
// POST /api/activities/:activityId/schedules/:scheduleId/participate
//
// Backend returns: { status: 'success', data: { participantCount: number } }
// We return the full JSON body so the caller can read participantCount
// and update its local "spots left" counter accordingly.
//
// Protected — must send Bearer token.
export async function registerParticipation(activityId, scheduleId, token) {

  const response = await fetch(
    `${API_BASE_URL}/api/activities/${activityId}/schedules/${scheduleId}/participate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    // Surface the backend message when possible so the UI can show
    // something more useful than a generic error. The backend uses
    // ApiError which serialises to { status: 'error', message: '...' }.
    let message = 'Failed to register for this session'
    try {
      const body = await response.json()
      if (body?.message) message = body.message
    } catch {
      // Body wasn't JSON — fall back to the default message.
    }
    throw new Error(message)
  }

  return response.json()
}

// ── unregisterParticipation ───────────────────────────────────
// DELETE /api/activities/:activityId/schedules/:scheduleId/participate
//
// Backend returns: { status: 'success', data: { participantCount: number } }
// Same shape as register — the caller uses participantCount to refresh
// the "spots left" display.
export async function unregisterParticipation(activityId, scheduleId, token) {

  const response = await fetch(
    `${API_BASE_URL}/api/activities/${activityId}/schedules/${scheduleId}/participate`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    let message = 'Failed to unregister from this session'
    try {
      const body = await response.json()
      if (body?.message) message = body.message
    } catch {
      // Non-JSON response — keep the default.
    }
    throw new Error(message)
  }

  return response.json()
}