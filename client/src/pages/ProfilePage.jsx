import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  fetchFavorites,
  removeFavorite,
} from '../services/FavoritesService.js'

import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'

export default function ProfilePage() {

  const { user, token } = useAuth()

  const [favoriteActivities, setFavoriteActivities] = useState([])
  const [loading, setLoading] = useState(true)

  // Temporary mock data until backend exists
  const [upcomingActivities] = useState([
    {
      id: 1,
      name: 'Football Training',
      date: '2026-05-20',
    },
    {
      id: 2,
      name: 'Yoga Session',
      date: '2026-05-24',
    },
  ])

  // ── Fetch favorite activities ─────────────────────────────
    useEffect(() => {
      

    async function loadFavorites() {

      try {

        const result = await fetchFavorites(token)

        setFavoriteActivities(result.data)

      } catch (error) {

        console.error('Failed to fetch favorites:', error)

      } finally {

        setLoading(false)
      }
    }

    loadFavorites()

  }, [token])

  // ── Remove favorite ──────────────────────────────────────
  async function handleRemoveFavorite(activityId) {

    try {

      await removeFavorite(activityId, token)

      setFavoriteActivities(
        favoriteActivities.filter(
          activity => activity.id !== activityId
        )
      )

    } catch (error) {

      console.error('Failed to remove favorite:', error)
    }
  }

  if (loading) {
    return <p>Loading profile...</p>
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
          fontSize: '2rem',
          marginBottom: 'var(--space-6)',
        }}
      >
        Profile
      </h1>

      {/* User info */}
      <Card
        padding="md"
        shadow="sm"
        style={{ marginBottom: '24px' }}
      >
        <h2>User Information</h2>

        <p>
          <strong>Name:</strong> {user?.name}
        </p>

        <p>
          <strong>Email:</strong> {user?.email}
        </p>

        <p>
          <strong>Role:</strong> {user?.role}
        </p>
      </Card>

      {/* Upcoming activities */}
      <Card
        padding="md"
        shadow="sm"
        style={{ marginBottom: '24px' }}
      >
        <h2>Upcoming Activities</h2>

        {upcomingActivities.length === 0 ? (
          <p>No upcoming activities.</p>
        ) : (
          upcomingActivities.map(activity => (
            <div
              key={activity.id}
              style={{ marginBottom: '12px' }}
            >
              <p>
                <strong>{activity.name}</strong>
              </p>

              <p>{activity.date}</p>
            </div>
          ))
        )}
      </Card>

      {/* Favorite activities */}
      <Card
        padding="md"
        shadow="sm"
      >
        <h2>Favorite Activities</h2>

        {favoriteActivities.length === 0 ? (
          <p>No favorites saved.</p>
        ) : (
          favoriteActivities.map(activity => (
            <div
              key={activity.id}
              style={{
                marginBottom: '20px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <h3>{activity.name}</h3>

              <p>{activity.description}</p>

              <p>
                <strong>Location:</strong>{' '}
                {activity.location}
              </p>

              <Button
                variant="secondary"
                onClick={() =>
                  handleRemoveFavorite(activity.id)
                }
              >
                Remove Favorite
              </Button>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}