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
      maxWidth: '1100px',
      margin: '0 auto',
    }}
  >

    {/* Hero / User Card */}
    <Card
      padding="lg"
      shadow="md"
      style={{
        marginBottom: '32px',
        background: 'var(--color-primary-light)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >

        <div>
          <h1
            style={{
              fontSize: '2.5rem',
              marginBottom: '8px',
            }}
          >
            {user?.name || 'Profile'}
          </h1>

          <p
            style={{
              color: 'var(--color-text-muted)',
              marginBottom: '12px',
            }}
          >
            {user?.email}
          </p>

          <span
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: '999px',
              background: 'var(--color-primary)',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            {user?.role}
          </span>
        </div>

        <div
          style={{
            minWidth: '180px',
          }}
        >
        </div>

      </div>
    </Card>

    {/* Upcoming Activities */}
    <div style={{ marginBottom: '32px' }}>

      <h2
        style={{
          marginBottom: '16px',
          fontSize: '1.5rem',
        }}
      >
        Upcoming Activities
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >

        {upcomingActivities.map(activity => (
          <Card
            key={activity.id}
            padding="md"
            shadow="sm"
          >
            <h3
              style={{
                marginBottom: '8px',
              }}
            >
              {activity.name}
            </h3>

            <p
              style={{
                color: 'var(--color-text-muted)',
              }}
            >
              {activity.date}
            </p>
          </Card>
        ))}

      </div>
    </div>

    {/* Favorite Activities */}
    <div>

      <h2
        style={{
          marginBottom: '16px',
          fontSize: '1.5rem',
        }}
      >
        Favorite Activities
      </h2>

      {favoriteActivities.length === 0 ? (

        <Card padding="md">
          <p>No favorites saved yet.</p>
        </Card>

      ) : (

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >

          {favoriteActivities.map(activity => (

            <Card
              key={activity.id}
              padding="md"
              shadow="sm"
            >
              <h3
                style={{
                  marginBottom: '10px',
                }}
              >
                {activity.name}
              </h3>

              <p
                style={{
                  color: 'var(--color-text-muted)',
                  marginBottom: '14px',
                  lineHeight: 1.5,
                }}
              >
                {activity.description}
              </p>

              <p
                style={{
                  marginBottom: '16px',
                  fontSize: '0.9rem',
                }}
              >
                <strong>Location:</strong> {activity.location}
              </p>

              <Button
                variant="secondary"
                onClick={() =>
                  handleRemoveFavorite(activity.id)
                }
              >
                Remove Favorite
              </Button>
            </Card>

          ))}

        </div>

      )}

    </div>

  </div>
)
}