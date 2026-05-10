import React, { useState } from 'react'
import Button from '../components/ui/Button.jsx'

// ─────────────────────────────────────────────────────────────
// ActivitiesPage
//
// Public page displaying upcoming sports activities.
// Supports:
// - Daily view
// - Weekly view
//
// Currently uses temporary mock data until the backend
// schedule/activity API is finalized.
// ─────────────────────────────────────────────────────────────

export default function ActivitiesPage() {

  // ── View State ────────────────────────────────────────────
  // Controls whether the user sees:
  // - today's activities
  // - activities for the upcoming week
  const [view, setView] = useState('daily')

  // ── Temporary Mock Data ──────────────────────────────────
  // Replace with API fetch once backend endpoint is ready.
  const activities = [
    {
      id: 1,
      title: 'Football Match',
      sport: 'Football',
      time: '2026-05-05T14:00:00',
      location: 'Main Field',
      availableSpots: 10,
    },

    {
      id: 2,
      title: 'Basketball Training',
      sport: 'Basketball',
      time: '2026-05-06T18:00:00',
      location: 'Gym Hall',
      availableSpots: 5,
    },

    {
      id: 3,
      title: 'Yoga Session',
      sport: 'Yoga',
      time: '2026-05-05T09:00:00',
      location: 'Studio A',
      availableSpots: 8,
    },
  ]

  // ── Filter Activities ────────────────────────────────────
  // Daily  → today's activities only
  // Weekly → activities within the next 7 days
  const today = new Date()

  const filteredActivities = activities.filter(activity => {
    const activityDate = new Date(activity.time)

    if (view === 'daily') {
      return activityDate.toDateString() === today.toDateString()
    }

    if (view === 'weekly') {
      const oneWeekLater = new Date()

      oneWeekLater.setDate(today.getDate() + 7)

      return activityDate >= today && activityDate <= oneWeekLater
    }

    return true
  })

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

      {/* Daily / Weekly toggle */}
      <div
        style={{
          marginBottom: 'var(--space-6)',
          display: 'flex',
          gap: 'var(--space-4)',
        }}
      >
        <Button
          variant={view === 'daily' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setView('daily')}
        >
          Daily
        </Button>

        <Button
          variant={view === 'weekly' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setView('weekly')}
        >
          Weekly
        </Button>
      </div>

      {/* Activity cards */}
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
        }}
      >
        {filteredActivities.map(activity => (
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
              {activity.title}
            </h2>

            {/* Activity details */}
            <p>
              <strong>Sport:</strong> {activity.sport}
            </p>

            <p>
              <strong>Time:</strong>{' '}
              {new Date(activity.time).toLocaleString()}
            </p>

            <p>
              <strong>Location:</strong> {activity.location}
            </p>

            <p>
              <strong>Available spots:</strong>{' '}
              {activity.availableSpots}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}