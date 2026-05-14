// src/pages/SchedulePage.jsx

import React, { useMemo, useState } from 'react'
import Button from '../components/ui/Button.jsx'

// ─────────────────────────────────────────────────────────────
// SchedulePage
//
// Homepage calendar-style schedule overview.
//
// Features:
// - Weekly / Monthly toggle
// - Calendar layout
// - Activity cards inside days
//
// TEMP:
// Uses mock data until backend integration is finished.
// ─────────────────────────────────────────────────────────────

export default function SchedulePage() {

  // ── View State ────────────────────────────────────────────
  const [view, setView] = useState('weekly')

  // ── Mock Activity Data ────────────────────────────────────
const activities = [
  {
    id: 1,
    title: 'Football Match',
    sport: 'Football',
    leader: 'Emma Svensson',
    date: '2026-05-15',
    time: '18:00',
    location: 'Main Field',
    availableSpots: 8,
    cancelled: false,
  },

  {
    id: 2,
    title: 'Basketball Training',
    sport: 'Basketball',
    leader: 'John Eriksson',
    date: '2026-05-16',
    time: '16:30',
    location: 'Gym Hall',
    availableSpots: 2,
    cancelled: true,
  },
]

  // ── Current Date ──────────────────────────────────────────
  
    const today = new Date()
    // Test for JUNE
    //const today = new Date('2026-06-15')
    

  // ── Generate Calendar Days ────────────────────────────────
  const days = useMemo(() => {

    const result = []

    if (view === 'weekly') {

      // Get Monday of current week
        const current = new Date()

        // Test for other months:
        // new Date('2026-01-15') // January
        // new Date('2026-06-15') // June
        // new Date('2026-12-15') // December

      const day = current.getDay()

      const diff = current.getDate() - day + (day === 0 ? -6 : 1)

      current.setDate(diff)

      // Create 7 days
      for (let i = 0; i < 7; i++) {

        const date = new Date(current)

        date.setDate(current.getDate() + i)

        result.push(date)
      }

    } else {

      // Monthly view
      const year = today.getFullYear()
      const month = today.getMonth()

      const daysInMonth = new Date(year, month + 1, 0).getDate()

      for (let i = 1; i <= daysInMonth; i++) {

        result.push(new Date(year, month, i))
      }
    }

    return result

  }, [view])

  // ── Helper: Activities For A Specific Day ────────────────
  function getActivitiesForDay(date) {

    const dateString = date.toISOString().split('T')[0]

    return activities.filter(activity => activity.date === dateString)
  }

  return (
    <div
      style={{
        padding: 'var(--space-6)',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >

        <h1
          style={{
            fontSize: '2.4rem',
            fontFamily: 'Georgia, serif',
          }}
        >
          HKIF Schedule
        </h1>

        {/* Weekly / Monthly Toggle */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
          }}
        >

          <Button
            variant={view === 'weekly' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setView('weekly')}
          >
            Weekly
          </Button>

          <Button
            variant={view === 'monthly' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setView('monthly')}
          >
            Monthly
          </Button>

        </div>
      </div>

{/* Month header, placed above the calendar */}
          <h2
  style={{
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '4px',
    marginBottom: '24px',
  }}
>
  {today.toLocaleDateString('en-US', {
    month: 'long',
  }).toUpperCase()}
</h2>

          {/* Calendar Grid */}
          <div
  style={{
                  border: '1px solid var(--color-border)',
       background: 'var(--color-surface-raised)'
  }}
>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0',
        }}
      >

        {days.map((date, index) => {

          const dayActivities = getActivitiesForDay(date)

          return (
            <div
              key={index}
              style={{
                minHeight: '220px',
                  //border: '1px solid var(--color-border)',
                borderRight: '1px solid var(--color-border)',
                borderBottom: '1px solid var(--color-border)',
                //borderRadius: '16px',
                padding: '16px',
                background: 'var(--color-surface-raised)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >

              {/* Day Header */}
              <div
  style={{
    borderBottom: '1px solid var(--color-border)',
    paddingBottom: '10px',
  }}
>

  {/* Date Number */}
  <p
    style={{
      fontSize: '2rem',
      fontWeight: 800,
      lineHeight: 1,
      marginBottom: '6px',
    }}
  >
    {date.getDate()}
  </p>

  {/* Weekday */}
  <p
    style={{
      color: 'var(--color-text-muted)',
      fontSize: '0.95rem',
      fontWeight: 500,
    }}
  >
    {date.toLocaleDateString('en-US', {
      weekday: 'long',
    })}
  </p>

</div>

              {/* Activities */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                          gap: '10px',
                  flex:1,
                }}
              >

                {dayActivities.length === 0 && (
                  <p
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '0.9rem',
                    }}
                  >
                    No activities
                  </p>
                )}

                                {dayActivities.map(activity => (

                  <div
                    key={activity.id}
                    style={{
                      background: activity.cancelled
                        ? 'rgba(192,57,43,0.08)'
                        : 'var(--color-primary-light)',

                      padding: '12px',

                      borderLeft: activity.cancelled
                        ? '4px solid var(--color-danger)'
                        : '4px solid var(--color-primary)',

                      display: 'flex',
                      flexDirection: 'column',
                        gap: '6px',
                      flex: 1,
                    }}
                  >

                    {/* Cancelled Banner */}
                    {activity.cancelled && (
                      <p
                        style={{
                          color: 'var(--color-danger)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          letterSpacing: '1px',
                        }}
                      >
                        CANCELLED
                      </p>
                    )}

                    {/* Title */}
                    <p
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      {activity.title}
                    </p>

                    {/* Sport */}
                    <p
                      style={{
                        fontSize: '0.9rem',
                      }}
                    >
                      {activity.sport}
                    </p>

                    {/* Leader */}
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Leader: {activity.leader}
                    </p>

                    {/* Time */}
                    <p
                      style={{
                        fontSize: '0.85rem',
                      }}
                    >
                      {activity.time}
                    </p>

                    {/* Location */}
                    <p
                      style={{
                        fontSize: '0.85rem',
                      }}
                    >
                      {activity.location}
                    </p>

                    {/* Spots */}
                    <p
                      style={{
                        fontSize: '0.85rem',
                      }}
                    >
                      {activity.availableSpots} spots left
                    </p>

                    {/* Attend Button */}
                    {!activity.cancelled && (
                    <Button
                        size="sm"
                        variant="primary"
                        style={{
                        marginTop: '8px',
                        }}
                    >
                        Attend
                    </Button>
                    )}

                  </div>

                ))}

              </div>
            </div>
          )
        })}

      </div>
    </div>
  </div>
)
}