import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ActivitiesPage() {
  // ── API State ─────────────────────────────────────────────
  const [activities, setActivities] = useState([])
  const [favoriteActivities, setFavoriteActivities] = useState([])
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Fetch Activities ──────────────────────────────────────
  
  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch(
          '/api/activities'
        )

        if (!response.ok) {
          throw new Error('Failed to fetch activities')
        }

        const result = await response.json()

        setActivities(result.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  // ── Fetch favorites from backend ──────────────────────────────────────
  useEffect(() => {

    async function fetchFavorites() {

      // Only fetch favorites if logged in
      if (!isAuthenticated) return

      try {

        const response = await fetch(
          '/api/users/me/favorites',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch favorites')
        }

        const result = await response.json()

        // Store only activity IDs
        const favoriteIds = result.data.map(
          activity => activity.id
        )

        setFavoriteActivities(favoriteIds)

      } catch (error) {

        console.error('Failed to fetch favorites:', error)
      }
    }

    fetchFavorites()

}, [isAuthenticated])

  // ── Loading / Error States ───────────────────────────────
  if (loading) {
    return <p>Loading activities...</p>
  }

  if (error) {
    return <p>Error: {error}</p>
  }

  // ── Display all activities ───────────────────────────────
  const filteredActivities = activities

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
      >
        {filteredActivities.length === 0 ? (
          <p>No activities found.</p>
        ) : (
          filteredActivities.map(activity => (
            <div
              key={activity.id}
              style={{
                position: 'relative',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '20px',
                background: 'var(--color-surface-raised)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              }}
            >
              {/* Activity title */}
              {/* Heart-button */}
              <button
                onClick={async () => {

                  if (!isAuthenticated) {
                    navigate('/login')
                    return
                  }

                  try {

                    // Remove favorite
                    if (favoriteActivities.includes(activity.id)) {

                      const response = await fetch(
                        `/api/users/me/favorites/${activity.id}`,
                        {
                          method: 'DELETE',
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      )

                      if (!response.ok) {
                        throw new Error('Failed to remove favorite')
                      }

                      setFavoriteActivities(
                        favoriteActivities.filter(id => id !== activity.id)
                      )

                    } else {

                      // Add favorite
                      const response = await fetch(
                        `/api/users/me/favorites/${activity.id}`,
                        {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      )

                      if (!response.ok) {
                        throw new Error('Failed to add favorite')
                      }

                      setFavoriteActivities([
                        ...favoriteActivities,
                        activity.id,
                      ])
                    }

                  } catch (error) {

                    console.error(error)
                  }
                }}

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
              <h2 style={{ marginBottom: '8px' }}>
                {activity.name}
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
            </div>
          ))
        )}
      </div>
    </div>
  )
}