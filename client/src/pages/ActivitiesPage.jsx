import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchFavorites, addFavorite, removeFavorite, } from '../services/FavoritesService.js'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'

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

        console.error('Failed to fetch favorites:', error)
      }
    }

    loadFavorites()

}, [isAuthenticated, token])

  // ── Loading / Error States ───────────────────────────────
  if (loading) {
    return <p>Loading activities...</p>
  }

  if (error) {
    return <p>Error: {error}</p>
  }

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

      console.error(error)

      // Restore previous state if request fails
      setFavoriteActivities(previousFavorites)
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
      >
        {filteredActivities.length === 0 ? (
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
            </Card>
          ))
        )}
      </div>
    </div>
  )
}