import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  fetchFavorites,
  addFavorite,
  removeFavorite,
} from '../services/FavoritesService.js'
import { AuthExpiredError } from '../services/AuthExpiredError.js'
import { API_BASE_URL } from '../services/apiConfig.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuthExpiredHandler } from '../hooks/useAuthExpiredHandler.js'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import ActivityListSkeleton from '../components/skeletons/ActivityListSkeleton.jsx'
import Badge, { STATUS_VARIANT } from '../components/ui/Badge.jsx'

export default function ActivitiesPage() {
  // ── API State ─────────────────────────────────────────────
  const [activities, setActivities] = useState([])
  const [favoriteActivities, setFavoriteActivities] = useState([])
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuth()
  const [loading, setLoading] = useState(true)

  // ── Toast + auth-expired plumbing (#30) ───────────────────
  // showToast:         surfaces API failures to the user. The early-
  //                    return error block was removed in step 2 of
  //                    this PR — toasts replace it.
  // handleAuthExpired: shared mid-session expiry handler. Clears auth
  //                    state, toasts, and redirects to /login with
  //                    the current URL preserved so the user lands
  //                    back here after re-authenticating.
  const { showToast }     = useToast()
  const handleAuthExpired = useAuthExpiredHandler()

  // ── Fetch Activities ──────────────────────────────────────
  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/activities`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch activities')
        }

        const result = await response.json()

        setActivities(result.data)
      } catch (err) {
        // Public endpoint — no auth-expired case to handle here.
        // Surface as a toast instead of the previous setError()
        // which had nothing left rendering it after step 2 of #30.
        showToast(
          err.message || 'Couldn\'t load activities. Please try again.',
          'error',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
    // showToast is stable (useCallback in ToastContext) so it's safe
    // to leave out of the deps array — this effect should only run
    // once on mount regardless.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fetch favorites from backend ──────────────────────────
  useEffect(() => {

    async function loadFavorites() {

      // Only fetch favorites if logged in
      if (!isAuthenticated) return

      try {

        const result = await fetchFavorites(token)

        const favoriteIds = result.data.map(
          activity => activity.id
        )

        setFavoriteActivities(favoriteIds)

      } catch (error) {

        // 401 → log them out and bounce to /login.
        // The hook handles the toast + redirect for us.
        if (error instanceof AuthExpiredError) {
          handleAuthExpired()
          return
        }

        // Anything else — quiet toast.
        // Failing to load favorites isn't catastrophic (the page
        // still works without filled hearts), so an error toast
        // is enough.
        console.error('Failed to fetch favorites:', error)
        showToast('Couldn\'t load your favorites.', 'error')
      }
    }

    loadFavorites()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token])

  // ── Display all activities ───────────────────────────────
  const filteredActivities = activities

  async function handleToggleFavorite(activityId) {

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const previousFavorites = favoriteActivities

    try {

      if (favoriteActivities.includes(activityId)) {

        // Optimistically remove from UI first
        setFavoriteActivities(
          favoriteActivities.filter(id => id !== activityId)
        )

        await removeFavorite(activityId, token)

      } else {

        // Optimistically add to UI first
        setFavoriteActivities([
          ...favoriteActivities,
          activityId,
        ])

        await addFavorite(activityId, token)
      }

    } catch (error) {

      // Restore previous state if request fails — same as before.
      setFavoriteActivities(previousFavorites)

      if (error instanceof AuthExpiredError) {
        handleAuthExpired()
        return
      }

      // The heart didn't stick — tell the user something failed
      // so they know to retry, instead of silently snapping back.
      console.error(error)
      showToast(
        'Couldn\'t update favorite. Please try again.',
        'error',
      )
    }
  }

  return (
    <div
      style={{
        padding: 'var(--space-6)',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      {/* Page title */}
      <h1
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '2rem',
          marginBottom: 'var(--space-6)',
        }}
      >
        Activities
      </h1>

      {/* Activity cards */}
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
        }}
        aria-busy={loading}
        // aria-busy tells screen readers the region is still updating —
        // the Skeleton primitive itself is aria-hidden so this is where
        // the loading announcement actually happens.
      >
        {loading ? (
          // While the API call is in flight, render placeholder cards
          // in the same grid the real ones will land in. No layout
          // shift when data arrives.
          <ActivityListSkeleton count={4} />
        ) : filteredActivities.length === 0 ? (
          <p>No activities found.</p>
        ) : (
          filteredActivities.map(activity => (
            <Card
              key={activity.id}
              padding="md"
              shadow="sm"
              style={{
                position: 'relative',
              }}
            >
              {/* Activity title */}
              {/* Heart-button */}
              <button
                onClick={() => handleToggleFavorite(activity.id)}

                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: favoriteActivities.includes(activity.id)
                    ? '#c0392b'
                    : '#999',
                }}
              >
                {favoriteActivities.includes(activity.id)
                  ? '♥'
                  : '♡'}
              </button>
              <h2 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {activity.name}
                {activity.defaultStatus === 'CANCELLED' && (
                  <Badge variant={STATUS_VARIANT[activity.defaultStatus]}>Cancelled</Badge>
                )}
              </h2>

              {/* Activity details */}
              <p>
                <strong>Location:</strong>{' '}
                {activity.location}
              </p>

              <p>
                <strong>Capacity:</strong>{' '}
                {activity.maxCapacity ?? 'Unlimited'}
              </p>

              {activity.description && (
                <p>
                  <strong>Description:</strong>{' '}
                  {activity.description}
                </p>
              )}

              {/* Time slots */}
              {activity.timeSlots?.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <strong>Time Slots:</strong>

                  {activity.timeSlots.map(slot => (
                    <p key={slot.id}>
                      {slot.weekday} —{' '}
                      {new Date(slot.startTime)
                        .toISOString()
                        .slice(11, 16)}
                      {' - '}
                      {new Date(slot.endTime)
                        .toISOString()
                        .slice(11, 16)}
                    </p>
                  ))}
                </div>
              )}

              {/* View Details Button */}
              <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/activities/${activity.id}`)}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}