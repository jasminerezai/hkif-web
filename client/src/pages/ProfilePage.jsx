import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  removeFavorite,
} from '../services/FavoritesService.js'
import {
  fetchProfile,
} from '../services/ProfileService.js'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge, {
  ROLE_VARIANT,
} from '../components/ui/Badge.jsx'

export default function ProfilePage() {

  // ── Auth ────────────────────────────────────────────────
  const { user, token } = useAuth()

  // ── State ───────────────────────────────────────────────

  // Favorite activities from backend
  const [favoriteActivities, setFavoriteActivities]
    = useState([])

  // Activities the user has registered/joined
  const [upcomingActivities, setUpcomingActivities]
    = useState([])

  // Loading state
  const [loading, setLoading]
    = useState(true)
  
  const [error, setError] = useState(null)

  // ── Fetch Profile ───────────────────────────────────────
  // Loads all profile-related data from a single endpoint:
  //
  // /api/users/me
  //
  // The endpoint is currently used for:
  // - favorites
  // - participations
  //
  // User identity data (name/email/role)
  // comes from AuthContext.

  useEffect(() => {

    async function loadProfile() {

      if (!token) return

      try {

        const { data } =
          await fetchProfile(token)


        const {
          favorites,
          participations,
        } = data

        setFavoriteActivities(favorites || [])

        setUpcomingActivities(
          participations || []
        )


      } catch (error) {

        setError('Failed to load profile.')

      } finally {

        setLoading(false)
      }
    }

    loadProfile()

  }, [token])

  // ── Remove Favorite ─────────────────────────────────────
  async function handleRemoveFavorite(activityId) {

    const previousFavorites = favoriteActivities

    // Optimistically update UI immediately
    setFavoriteActivities(
      favoriteActivities.filter(
        activity => activity.id !== activityId
      )
    )

    try {

      await removeFavorite(activityId, token)

    } catch (error) {

      console.error(
        'Failed to remove favorite:',
        error
      )

      // Roll back if request fails
      setFavoriteActivities(previousFavorites)
    }
  }

  // ── Loading State ───────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          padding: 'var(--space-6)',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <Card padding="lg">
          <p>Loading profile...</p>
        </Card>
      </div>
    )
  }

  // ── Error State ───────────────────────────────────────
  if (error) {
  return (
    <div
      style={{
        padding: 'var(--space-6)',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >
      <Card padding="lg">
        <p>{error}</p>
      </Card>
    </div>
  )
}

  // ── Render ──────────────────────────────────────────────
  return (

    <div
      style={{
        padding: 'var(--space-6)',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >

      {/* ── Hero / User Card ───────────────────────────── */}
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

          {/* User info */}
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

            {/* Role badge */}
            <Badge
              variant={ROLE_VARIANT[user?.role]}
            >
              {user?.role}
            </Badge>

          </div>

        </div>

      </Card>

      {/* ── Upcoming Activities ────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>

        <h2
          style={{
            marginBottom: '16px',
            fontSize: '1.5rem',
          }}
        >
          Upcoming Activities
        </h2>

        {upcomingActivities.length === 0 ? (

          <Card padding="md">
            <p>No upcoming activities.</p>
          </Card>

        ) : (

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >

            {upcomingActivities.map(schedule => (

              <Card
                key={schedule.id}
                padding="md"
                shadow="sm"
              >

                <h3
                  style={{
                    marginBottom: '8px',
                  }}
                >
                  {schedule.activity.name}
                </h3>

                <p
                  style={{
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {new Date(schedule.startAt).toLocaleDateString()}
                </p>

              </Card>

            ))}

          </div>

        )}

      </div>

      {/* ── Favorite Activities ────────────────────────── */}
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
              gridTemplateColumns:
                'repeat(auto-fit, minmax(280px, 1fr))',
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
                  <strong>Location:</strong>{' '}
                  {activity.location}
                </p>

                <Button
                  variant="outline"
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