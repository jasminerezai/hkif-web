import React, { useState, useEffect } from 'react'

export default function ActivitiesPage() {
  // ── API State ─────────────────────────────────────────────
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Fetch Activities ──────────────────────────────────────
  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch(
          'http://localhost:3001/api/activities'
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
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '20px',
                background: 'var(--color-surface-raised)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              }}
            >
              {/* Activity title */}
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