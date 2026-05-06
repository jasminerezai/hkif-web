import React, { useState } from 'react'

export default function ActivitiesPage() {
  const [view, setView] = useState('daily')

  // TEMP mock data until backend is fully finished
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
        padding: '48px 24px',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <h1
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '2rem',
          marginBottom: '24px',
        }}
      >
        Activities
      </h1>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setView('daily')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: view === 'daily' ? '#5a9e1f' : '#ddd',
            color: view === 'daily' ? 'white' : 'black',
          }}
        >
          Daily
        </button>

        <button
          onClick={() => setView('weekly')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: view === 'weekly' ? '#5a9e1f' : '#ddd',
            color: view === 'weekly' ? 'white' : 'black',
          }}
        >
          Weekly
        </button>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredActivities.map(activity => (
          <div
            key={activity.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '20px',
              background: 'white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            }}
          >
            <h2 style={{ marginBottom: '8px' }}>{activity.title}</h2>

            <p><strong>Sport:</strong> {activity.sport}</p>

            <p>
              <strong>Time:</strong>{' '}
              {new Date(activity.time).toLocaleString()}
            </p>

            <p><strong>Location:</strong> {activity.location}</p>

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