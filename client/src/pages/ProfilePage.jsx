import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  removeFavorite,
} from '../services/FavoritesService.js'
import {
  fetchProfile,
} from '../services/ProfileService.js'
import {
  fetchManageableActivities,
} from '../services/ManageActivitiesService.js'
import { MANAGER_ROLES, ROLES } from '../constants/roles.js'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge, {
  ROLE_VARIANT,
  STATUS_VARIANT,
} from '../components/ui/Badge.jsx'
import ProfileSkeleton, {
  ManageActivitiesGridSkeleton,
} from '../components/skeletons/ProfileSkeleton.jsx'
import { API_BASE_URL } from '../services/apiConfig.js'

export default function ProfilePage() {

// ── Auth ────────────────────────────────────────────────
  const { user, token, getAuthHeader } = useAuth()
  const navigate = useNavigate()

  // ── Role gate ───────────────────────────────────────────
  // Single source of truth for "should this user see the
  // Manage Activities section?" — used both to skip the fetch
  // in step 2's effect and to conditionally render the section
  // below. Computed here so both spots can't drift apart.
  const canManage = MANAGER_ROLES.includes(user?.role)

  // Statistics dashboard is ADMIN-only — strictly narrower than
  // canManage because the backend endpoint is ADMIN-gated.
  // Computed alongside canManage so both role checks live in
  // the same spot and can't drift apart.
  const isAdmin = user?.role === ROLES.ADMIN

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

  // ── Manage Activities state (ADMIN / BOARD_MEMBER only) ─
  // Populated by a separate effect below that only fires for
  // users with a role in MANAGER_ROLES. For MEMBER / LEADER the
  // array stays empty and the Manage Activities section just
  // doesn't render (step 3).
  //
  // manageLoading is tracked independently from the main `loading`
  // flag so the favorites/participations sections aren't blocked
  // waiting for this extra fetch — the hero card and existing
  // sections can paint as soon as /api/users/me resolves.
  const [manageableActivities, setManageableActivities]
    = useState([])

  const [manageLoading, setManageLoading]
    = useState(false)
  
  
  const [leaderActivities, setLeaderActivities] = useState([])

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

  // ── Fetch Manageable Activities ─────────────────────────
  // Only ADMIN and BOARD_MEMBER see the Manage Activities
  // section, so we only hit the network for those roles.
  // Gating client-side avoids a pointless fetch for every
  // MEMBER who opens their profile.
  //
  // user?.role guards against the brief render where AuthContext
  // is still rehydrating from localStorage and user is null —
  // re-running once role is available is fine, the dependency
  // array picks it up.
  //
  // Note: backend access control is still the real enforcement
  // layer — the endpoint is public so any role *could* call it,
  // but a MEMBER has no UI to act on the data.
  useEffect(() => {

    if (!user?.role) return

    if (!MANAGER_ROLES.includes(user.role)) return

    async function loadManageableActivities() {

      setManageLoading(true)

      try {

        const { data } =
          await fetchManageableActivities()

        setManageableActivities(data || [])

      } catch (error) {

        // Soft-fail: log but don't block the rest of the page.
        // The favorites + participations sections are still useful
        // even if the management list fails to load. We'll surface
        // an empty-state message in step 3.
        console.error(
          'Failed to load manageable activities:',
          error
        )

      } finally {

        setManageLoading(false)
      }
    }

    loadManageableActivities()

  }, [user?.role])


  // Fetch leader

  useEffect(() => {
  if (user?.role !== ROLES.LEADER) return

  fetch(`${API_BASE_URL}/api/activities`, {
    headers: {
      ...getAuthHeader(),
    },
  })
    .then(res => res.json())
    .then(json => {
      if (json.status === 'success') {

        const assigned = json.data.filter(activity =>
          activity.leaders?.some(
            leader => leader.id === user.id
          )
        )

        setLeaderActivities(assigned)
      }
    })
    .catch(() => {
      console.error('Failed to load leader activities')
    })
}, [user, getAuthHeader])

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
  // Renders the full page shape as shimmering placeholders so
  // the layout doesn't jump when /api/users/me resolves.
  // canManage is already available here — AuthContext hydrates
  // user.role from localStorage before the profile fetch fires.
  if (loading) {
    return <ProfileSkeleton canManage={canManage} />
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

          {/* ── Admin-only quick action ─────────────────────
              Entry point to /admin/statistics. Only rendered
              for ADMIN — BOARD_MEMBER doesn't see this even
              though they see the manage section below, because
              the stats endpoint is ADMIN-only on the backend.
              Sits inside the hero card's flex row so it floats
              to the right of the user info on desktop and wraps
              below on narrow viewports (the row already has
              flexWrap: 'wrap'). */}
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/statistics')}
            >
              📊 Open Statistics
            </Button>
          )}

        </div>

      </Card>

      {/* ── Manage Activities (ADMIN / BOARD_MEMBER only) ─
          Rendered above Upcoming/Favorites because for these
          roles the management dashboard *is* the primary use
          of /profile — favorites/upcoming are secondary.
          Hidden entirely for MEMBER and LEADER (LEADER has its
          own dashboard in a separate ticket). */}
      {canManage && (

        <div style={{ marginBottom: '32px' }}>

          {/* Section header row: title on the left, primary
              action on the right. Flex layout (not the bare
              h2 we had before) so the "Create New Activity"
              button can sit inline with the heading. Wraps on
              narrow viewports so the button drops below the
              title instead of overflowing.
              The button is rendered here — outside the
              loading / empty / populated branches below — so
              it's always available regardless of whether the
              manage list is loaded, empty, or in flight.
              Creating a new activity doesn't depend on the
              existing list at all. */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >

            <h2 style={{ fontSize: '1.5rem' }}>
              Manage Activities
            </h2>

            {/* Routes to /activities/new — already exists in
                App.jsx and is also protected by MANAGER_ROLES,
                so the same users who see this button are the
                same ones who can reach the form. The route
                reuses ActivityFormPage (same component as the
                edit flow), the form just detects the missing
                :id and renders in create mode. */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/activities/new')}
            >
              + Create New Activity
            </Button>

          </div>


          {/* Three render states:
              1. manageLoading       — fetch in flight
              2. empty array         — nothing to manage yet
              3. populated array     — the grid of cards
              Kept inline (no extracted sub-component) to match
              the pattern already used by Upcoming / Favorites
              below — easier to read in one place for review. */}
          {manageLoading ? (

            // Shares the same shape as the real grid below, so
            // when the fetch lands the card layout doesn't shift.
            <ManageActivitiesGridSkeleton />

          ) : manageableActivities.length === 0 ? (

            <Card padding="md">
              <p>No activities to manage yet.</p>
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

              {manageableActivities.map(activity => (

                <Card
                  key={activity.id}
                  padding="md"
                  shadow="sm"
                  style={{
                    // position: relative so the absolutely
                    // positioned edit-pen anchors to this card.
                    // Same pattern ActivitiesPage uses for the
                    // heart-favorite button.
                    position: 'relative',
                  }}
                >

                  {/* ── Quick-edit pen (top-right) ──────────
                      Mirrors the heart-button on ActivitiesPage
                      so the interaction feels familiar. Routes
                      straight to the existing edit form — no new
                      page needed since /activities/:id/edit is
                      already wired up in App.jsx and protected
                      by EDITOR_ROLES. */}
                  <button
                    onClick={() =>
                      navigate(`/activities/${activity.id}/edit`)
                    }
                    aria-label={`Edit ${activity.name}`}
                    title="Edit activity"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      color: 'var(--color-text-muted)',
                      padding: '4px 8px',
                      lineHeight: 1,
                    }}
                  >
                    ✎
                  </button>

                  {/* Title + status badge.
                      paddingRight leaves room for the pen so
                      long activity names don't run under it. */}
                  <h3
                    style={{
                      marginBottom: '8px',
                      paddingRight: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {activity.name}

                    {activity.defaultStatus === 'CANCELLED' && (
                      <Badge
                        variant={
                          STATUS_VARIANT[activity.defaultStatus]
                        }
                      >
                        Cancelled
                      </Badge>
                    )}
                  </h3>

                  <p
                    style={{
                      color: 'var(--color-text-muted)',
                      marginBottom: '12px',
                      fontSize: '0.9rem',
                    }}
                  >
                    <strong>Location:</strong>{' '}
                    {activity.location}
                  </p>

                  {/* Explicit "Edit Activity" button.
                      The pen is a fast-path for power users; this
                      button is the obvious, labelled action for
                      anyone who doesn't recognise the icon. Both
                      navigate to the same place — duplication is
                      intentional for discoverability. */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`/activities/${activity.id}/edit`)
                    }
                  >
                    Edit Activity
                  </Button>

                </Card>

              ))}

            </div>

          )}

        </div>

      )}


      {user?.role === ROLES.LEADER && (
  <div style={{ marginBottom: '32px' }}>
    <Card>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}>
        
        <div>
          <h2 style={{
            fontSize: 'var(--text-xl)',
            marginBottom: '4px',
          }}>
            Your Activities
          </h2>

          <p style={{
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
          }}>
            Activities you are assigned to lead.
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}>

{leaderActivities.map(activity => {
  return (
    <div
      key={activity.id}
      style={{
        padding: 'var(--space-4)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface-raised)',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: 'var(--text-base)',
            fontWeight: 700,
          }}>
            {activity.name}
          </h3>

          <p style={{
            margin: '4px 0 0',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
          }}>
            {activity.description}
          </p>

          <Badge
            variant={STATUS_VARIANT[activity.defaultStatus]}
          >
            {activity.defaultStatus}
          </Badge>
        </div>

        
        
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            navigate(`/activities/${activity.id}/edit`)
          }
        >
            Manage
          </Button>
                </div>
              </div>
            )
          })}
          </div>
        </div>
      </Card>
    </div>
  )}
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