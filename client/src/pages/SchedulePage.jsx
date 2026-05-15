import React, { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button.jsx'

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

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
    
    const navigate = useNavigate()

    const { isAuthenticated } = useAuth()

    const [loading, setLoading] = useState(true)

    //This stores which activity IDs the user joined
    const [attendingActivities, setAttendingActivities] = useState([])

  // ── Mock Activity Data ────────────────────────────────────
const [activities, setActivities] = useState([])

// TEMP fallback mock data 
const mockActivities = [
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
    id: 3,
    title: 'Football Match',
    sport: 'Football',
    leader: 'Emma Svensson',
    date: '2026-05-01',
    time: '18:00',
    location: 'Main Field',
    availableSpots: 8,
    cancelled: false,
  },

  {
    id: 4,
    title: 'Basketball Training',
    sport: 'Basketball',
    leader: 'John Eriksson',
    date: '2026-05-14',
    time: '16:30',
    location: 'Gym Hall',
    availableSpots: 2,
    cancelled: true,
  },

  {
    id: 5,
    title: 'Football Match',
    sport: 'Football',
    leader: 'Emma Svensson',
    date: '2026-05-14',
    time: '18:00',
    location: 'Gym Hall',
    availableSpots: 8,
    cancelled: false,
    notes: 'Bring indoor shoes',
  },

  {
    id: 6,
    title: 'Basketball Training',
    sport: 'Basketball',
    leader: 'John Eriksson',
    date: '2026-05-30',
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
    
// ── Fetch Current Schedule ───────────────────────────────
useEffect(() => {

  async function fetchSchedule() {

    try {

      const response = await fetch(
        '/api/schedules/current'
      )

      const {data} = await response.json()

      console.log('Schedule API:', data)

      // If backend returns schedule data
      if (response.ok && Array.isArray(data)) {

              // Transform backend format → frontend format
        const formattedActivities = data.map(singleSchedule => ({

          id: singleSchedule.id,

          activityId: singleSchedule.activityId,

          title:
            singleSchedule.activity?.name || 'Activity',

          sport:
            singleSchedule.activity?.name || 'Sport',

          leader:
            singleSchedule.leaders
              ?.map(leader => leader.profileName || 'Leader')
              .join(', ') || 'Leader',

          date: (() => {

            const startDate = new Date(singleSchedule.startAt)

            return `${startDate.getFullYear()}-${
              String(startDate.getMonth() + 1).padStart(2, '0')
            }-${
              String(startDate.getDate()).padStart(2, '0')
            }`

          })(),

          time: new Date(singleSchedule.startAt)
            .toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),

          location:
            singleSchedule.activity?.location || 'Unknown',

          availableSpots:
            singleSchedule.activity?.maxCapacity || 0,

          cancelled:
            singleSchedule.status === 'CANCELLED',

          notes:
            singleSchedule.activity?.notes || '',

      }))

        setActivities(formattedActivities)
      }

    } catch (error) {

      console.error('Failed to fetch schedule:', error)
    } finally {
        setLoading(false)
    }
  }

  fetchSchedule()

}, [])

  // ── Generate Calendar Days ────────────────────────────────
  const days = useMemo(() => {

    const result = []

    if (view === 'weekly') {

      // Get Monday of current week
        const current = new Date(today)

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

      
    //This uses local date & local timezone instead of UTC conversion
    const dateString =
  `${date.getFullYear()}-${
    String(date.getMonth() + 1).padStart(2, '0')
  }-${
    String(date.getDate()).padStart(2, '0')
  }`

      const displayedActivities =
  activities.length > 0
    ? activities
    : mockActivities

return displayedActivities.filter(
  activity => activity.date === dateString
)
    //return activities.filter(activity => activity.date === dateString)
  }

    if (loading) {
        return (
            <div style={{ padding: '48px' }}>
            <p>Loading schedule...</p>
            </div>
        )
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
                      {activity.availableSpots} spots left</p>
                                    
                    {/* Notes */}
                    {activity.notes && (
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--color-text-muted)',
                          marginTop: '4px',
                        }}
                      >
                        {activity.notes}
                      </p>
                    )}              

                    {/* Attend Button */}
                    {!activity.cancelled && (

                    <Button
                        size="sm"

                        variant={
                        attendingActivities.includes(activity.id)
                            ? 'ghost'
                            : 'primary'
                        }

                        style={{
                        marginTop: '8px',
                        }}

                        onClick={() => {

                        // Redirect logged-out users
                        if (!isAuthenticated) {
                            navigate('/login')
                            return
                        }

                        // Toggle attendance
                        if (attendingActivities.includes(activity.id)) {

                            setAttendingActivities(
                            attendingActivities.filter(id => id !== activity.id)
                            )

                        } else {

                            setAttendingActivities([
                            ...attendingActivities,
                            activity.id,
                            ])
                        }
                        }}
                    >

                        {attendingActivities.includes(activity.id)
                        ? 'Leave'
                        : 'Attend'}

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