import React, { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import ScheduleFilters from '../components/ScheduleFilters.jsx'
import ScheduleSkeleton from '../components/skeletons/ScheduleSkeleton.jsx'

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchFavorites } from '../services/FavoritesService.js'
import { AuthExpiredError } from '../services/AuthExpiredError.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuthExpiredHandler } from '../hooks/useAuthExpiredHandler.js'
import {
  registerParticipation,
  unregisterParticipation,
} from '../services/ParticipationService.js'

// Central API base URL — prepends the backend origin in production
// while staying empty in dev so the vite proxy keeps working.
import { API_BASE_URL } from '../services/apiConfig.js'

// ─────────────────────────────────────────────────────────────
// SchedulePage
//
// Homepage calendar-style schedule overview.
//
// Features:
// - Weekly / Monthly toggle
// - Calendar layout
// - Activity cards inside days
// - Filter bar: sport, day-of-week, favorites only (logged-in users)
//
// TEMP:
// Uses mock data until backend integration is finished.
// ─────────────────────────────────────────────────────────────

// Mapping JS Date.getDay() (0=Sun..6=Sat) to the enum strings
// used by the day-of-week filter. Kept module-level so we don't
// rebuild it on every render.
const WEEKDAY_BY_INDEX = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY',
  'THURSDAY', 'FRIDAY', 'SATURDAY',
]

export default function SchedulePage() {

  // ── View State ────────────────────────────────────────────
  const [view, setView] = useState('weekly')

  const navigate = useNavigate()

  const { isAuthenticated, token } = useAuth()

  const [loading, setLoading] = useState(true)

  // ── Toast + auth-expired plumbing (#30) ───────────────────
  // showToast:         user-facing notifier for fetch failures.
  // handleAuthExpired: shared mid-session expiry handler — logs out,
  //                    toasts, and redirects to /login with the
  //                    current URL preserved for return.
  const { showToast }     = useToast()
  const handleAuthExpired = useAuthExpiredHandler()

  // Activity IDs the user has joined (attendance, NOT favorites)
  const [attendingActivities, setAttendingActivities] = useState([])

  // ── Filter State ──────────────────────────────────────────
  // 'ALL' = sentinel value meaning "no filter applied".
  // Using a string instead of null keeps the <select> happy
  // (a controlled <select value={null}> warns in React).
  const [filterSport, setFilterSport] = useState('ALL')
  const [filterDay, setFilterDay] = useState('ALL')
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false)

  // ── Favorites (logged-in users only) ──────────────────────
  // Stores the user's favorited activity-template IDs.
  // Used by the "Favorites only" filter to decide which
  // schedule entries to keep.
  const [favoriteIds, setFavoriteIds] = useState([])

  // Tracks whether the last attempt to load favorites failed.
  // We only surface this to the user when the "Favorites only"
  // filter is actually active — no point alarming someone who
  // never turned the filter on. Without this, a failed favorites
  // request would just make the schedule look mysteriously empty.
  const [favoritesError, setFavoritesError] = useState(false)

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
        // Single fetch — API_BASE_URL is '' in dev so the
        // vite proxy handles it, and the deployed backend
        // origin in production.
        const response = await fetch(
          `${API_BASE_URL}/api/schedules/current`
        )

        const { data } = await response.json()

        console.log('Schedule API:', data)

        // If backend returns schedule data
        if (response.ok && Array.isArray(data)) {

          // Transform backend format → frontend format
          const formattedActivities = data.map(singleSchedule => ({

            id: singleSchedule.id,

            // activityId is the *template activity* id — the same
            // ID that the favorites endpoint stores. We keep it
            // so the "Favorites only" filter can match correctly.
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

              return `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')
                }-${String(startDate.getDate()).padStart(2, '0')
                }`

            })(),

            time: new Date(singleSchedule.startAt)
              .toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),

            location:
              singleSchedule.activity?.location || 'Unknown',

            // Max capacity from the activity template + the number
            // of currently registered participants. We compute
            // "spots left" at render time as the difference between
            // these two. Both fields drive the disable-when-full
            // logic on the Attend button.
            //
            // NOTE: the /api/schedules/current endpoint doesn't
            // include participantCount yet, so we default it to 0
            // on initial load. The count updates correctly the
            // moment the user clicks Attend / Leave (the response
            // from /participate returns the authoritative count).
            // Backend ticket needed to include participantCount in
            // the schedule list response for accurate first paint.
            maxCapacity:
              singleSchedule.activity?.maxCapacity ?? null,
            participantCount:
              singleSchedule.participantCount ?? 0,

            cancelled:
              singleSchedule.status === 'CANCELLED',

            notes:
              singleSchedule.activity?.notes || '',

          }))

          setActivities(formattedActivities)
        }

      } catch (error) {

        // Public endpoint, but the network could still fail or the
        // backend could 500. Previously this was silent + the page
        // just rendered empty — now we tell the user with a toast
        // so they know to retry instead of staring at mock data.
        console.error('Failed to fetch schedule:', error)
        showToast(
          'Couldn\'t load the schedule. Please try again.',
          'error',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()

    // showToast is stable (useCallback) — keeping the deps array
    // empty preserves the original "fetch once on mount" behaviour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fetch Favorites (logged-in users only) ───────────────
  // Mirrors the pattern already used in ActivitiesPage so the
  // behaviour is consistent across the app. If the user logs
  // out we reset the list to [] so the favorites filter goes
  // empty rather than holding stale data.
  //
  // We also track favoritesError so the UI can warn the user
  // when "Favorites only" is on but the list never loaded.
  useEffect(() => {

    async function loadFavorites() {

      if (!isAuthenticated) {
        setFavoriteIds([])
        // Clear any stale error from a previous session so a
        // logged-out user doesn't see a leftover warning.
        setFavoritesError(false)
        return
      }

      try {
        // Reset the error flag before each attempt so a
        // successful retry hides the previous warning.
        setFavoritesError(false)

        const result = await fetchFavorites(token)
        const ids = result.data.map(activity => activity.id)
        setFavoriteIds(ids)
      } catch (error) {
        console.error('Failed to fetch favorites:', error)

        // 401 → session expired mid-session, full logout + redirect.
        if (error instanceof AuthExpiredError) {
          handleAuthExpired()
          return
        }

        // Other errors → keep the existing contextual banner
        // behaviour. We deliberately don't toast here because most
        // users on this page never enable the "Favorites only"
        // filter and don't care that the background favorites fetch
        // failed. The inline banner below already shows up if/when
        // it actually matters.
        setFavoritesError(true)
      }
    }

    loadFavorites()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token])

  // ── Activity Source ──────────────────────────────────────
  // Falls back to mock data while the backend is still being
  // hooked up. Defined as a memo so downstream hooks have a
  // stable reference between renders.
  const displayedActivities = useMemo(() => (
    activities.length > 0 ? activities : mockActivities
  ), [activities])

  // ── Derived: Unique Sport Types ──────────────────────────
  // Auto-builds the sport dropdown options from whatever data
  // is currently loaded. As the backend adds more sports the
  // dropdown updates automatically — no hardcoded list to keep
  // in sync.
  const sportTypes = useMemo(() => {

    const set = new Set()

    displayedActivities.forEach(activity => {
      if (activity.sport) {
        set.add(activity.sport)
      }
    })

    // Sorted alphabetically so the dropdown is predictable.
    return Array.from(set).sort()

  }, [displayedActivities])

  // ── Derived: Filtered Activities ─────────────────────────
  // Applies the sport + favorites filters here (these don't
  // depend on the date being rendered, so we do them once and
  // reuse the result for every calendar cell).
  //
  // The day-of-week filter is NOT applied here — it depends
  // on the specific date of each calendar cell, so it lives
  // inside getActivitiesForDay() below.
  const filteredActivities = useMemo(() => {

    return displayedActivities.filter(activity => {

      // Sport filter
      if (filterSport !== 'ALL' && activity.sport !== filterSport) {
        return false
      }

      // Favorites filter
      // Real schedule entries carry activity.activityId. Mock data
      // doesn't, so we fall back to activity.id to avoid crashes
      // while the backend is being wired up.
      if (filterFavoritesOnly) {
        const idToCheck = activity.activityId ?? activity.id
        if (!favoriteIds.includes(idToCheck)) {
          return false
        }
      }

      return true
    })

  }, [
    displayedActivities,
    filterSport,
    filterFavoritesOnly,
    favoriteIds,
  ])

  // ── Generate Calendar Days ────────────────────────────────
  const days = useMemo(() => {

    const result = []

    if (view === 'weekly') {

      // Get Monday of current week
      const current = new Date(today)

      const day = current.getDay()
      const diff = current.getDate() - day + (day === 0 ? -6 : 1)

      current.setDate(diff)

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

    // Day-of-week filter: if set, only return activities for
    // calendar cells that fall on the chosen weekday.
    if (filterDay !== 'ALL') {
      const weekdayName = WEEKDAY_BY_INDEX[date.getDay()]
      if (weekdayName !== filterDay) {
        return []
      }
    }

    // Build YYYY-MM-DD from local-timezone parts (NOT UTC),
    // matching the format we stored on each activity above.
    const dateString =
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')
      }-${String(date.getDate()).padStart(2, '0')
      }`

    return filteredActivities.filter(
      activity => activity.date === dateString
    )
  }

// ── Filter handlers ──────────────────────────────────────
  function handleClearFilters() {
    setFilterSport('ALL')
    setFilterDay('ALL')
    setFilterFavoritesOnly(false)
  }

  // ── Toggle Attendance ────────────────────────────────────
  // Wires the Attend / Leave button on each card to the backend.
  // Pattern mirrors ActivitiesPage.handleToggleFavorite:
  //   1. Optimistically update local state (snappy UI)
  //   2. Call the API
  //   3. On success, overwrite participantCount with the server's
  //      authoritative value — THIS is the actual bug fix; the
  //      counter previously never moved after register/unregister
  //   4. On failure, roll back both attendance + count
  async function handleToggleAttendance(activity) {

    // Logged-out users get redirected before any state changes
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Real backend entries carry activity.activityId. Without it
    // we can't hit /participate, so the mock-data dev path stays
    // a pure local toggle. Once the backend is fully seeded and
    // the schedule API is hooked up, this guard never triggers.
    if (!activity.activityId) {
      setAttendingActivities(prev =>
        prev.includes(activity.id)
          ? prev.filter(id => id !== activity.id)
          : [...prev, activity.id]
      )
      return
    }

    const isCurrentlyAttending = attendingActivities.includes(activity.id)

    // Snapshots so we can roll back if the request fails
    const previousAttending = attendingActivities
    const previousCount    = activity.participantCount

    // ── Optimistic update ────────────────────────────────
    // Toggle attendance and nudge the count by ±1 so the card
    // reacts instantly. The server's response will reconcile
    // any drift a moment later.
    if (isCurrentlyAttending) {
      setAttendingActivities(prev => prev.filter(id => id !== activity.id))
      setActivities(prev => prev.map(a =>
        a.id === activity.id
          ? { ...a, participantCount: Math.max(0, (a.participantCount ?? 0) - 1) }
          : a
      ))
    } else {
      setAttendingActivities(prev => [...prev, activity.id])
      setActivities(prev => prev.map(a =>
        a.id === activity.id
          ? { ...a, participantCount: (a.participantCount ?? 0) + 1 }
          : a
      ))
    }

    // ── API call + reconcile ─────────────────────────────
    try {
      const apiResponse = isCurrentlyAttending
        ? await unregisterParticipation(activity.activityId, activity.id, token)
        : await registerParticipation(activity.activityId, activity.id, token)

      // Server count is authoritative. Overwriting it here is the
      // line that closes the bug ticket — the response shape is
      // { status, data: { participantCount } }.
      const serverCount = apiResponse?.data?.participantCount
      if (typeof serverCount === 'number') {
        setActivities(prev => prev.map(a =>
          a.id === activity.id
            ? { ...a, participantCount: serverCount }
            : a
        ))
      }
    } catch (error) {
      console.error('Failed to update participation:', error)
      // Roll everything back to the pre-click snapshot
      setAttendingActivities(previousAttending)
      setActivities(prev => prev.map(a =>
        a.id === activity.id ? { ...a, participantCount: previousCount } : a
      ))
    }
  }


  if (loading) {
    // Full-page skeleton: keeps the header / filters / grid in place
    // visually so the page doesn't pop in once data arrives.
    return <ScheduleSkeleton />
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
        <div style={{ display: 'flex', gap: '12px' }}>

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

      {/* ── Filter bar ──────────────────────────────────────
          Lives between the header and the month label so it
          reads top-to-bottom: title → filters → calendar.
      ──────────────────────────────────────────────────── */}
      <ScheduleFilters
        sportTypes={sportTypes}
        filterSport={filterSport}
        onFilterSportChange={setFilterSport}
        filterDay={filterDay}
        onFilterDayChange={setFilterDay}
        isAuthenticated={isAuthenticated}
        filterFavoritesOnly={filterFavoritesOnly}
        onFilterFavoritesChange={setFilterFavoritesOnly}
        onClear={handleClearFilters}
      />

      {/* ── Favorites load error ─────────────────────────────
          Only shown when the user actually has the favorites
          filter on. Otherwise we'd be nagging users who never
          enabled it about a request they didn't care about.

          Styled inline with --color-danger so it matches the
          cancelled-activity treatment below and the rest of
          the project's existing visual language (no toast lib
          in the project yet).

          NOTE: 401s no longer reach this branch — the catch
          block above routes session expiry through
          handleAuthExpired (toast + redirect to /login).
          This banner only appears for non-401 favorites
          failures, which is the right UX.
      ──────────────────────────────────────────────────── */}
      {filterFavoritesOnly && favoritesError && (
        <p
          role="alert"
          style={{
            color: 'var(--color-danger)',
            background: 'rgba(192,57,43,0.08)',
            borderLeft: '4px solid var(--color-danger)',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '0.9rem',
          }}
        >
          Couldn&apos;t load your favorites — the schedule may look
          empty. Please try again in a moment.
        </p>
      )}

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
          background: 'var(--color-surface-raised)',
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
                  borderRight: '1px solid var(--color-border)',
                  borderBottom: '1px solid var(--color-border)',
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

                  {dayActivities.map(activity => {
                  // ── Per-card derived state ────────────────
                    // Computed once per render of this card so
                    // the spots counter and the button can share
                    // the same source of truth.
                    const isAttending = attendingActivities.includes(activity.id)

                    // Real backend cards have maxCapacity + participantCount.
                    // Mock cards still use the legacy availableSpots field,
                    // so we keep a fallback to avoid breaking the dev preview.
                    const hasCapacityData = (
                      typeof activity.maxCapacity      === 'number' &&
                      typeof activity.participantCount === 'number'
                    )

                    const spotsLeft = hasCapacityData
                      ? Math.max(0, activity.maxCapacity - activity.participantCount)
                      : activity.availableSpots

                    const isFull = hasCapacityData
                      && activity.participantCount >= activity.maxCapacity

                    return (

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
                      <p style={{ fontWeight: 700 }}>
                        {activity.activityId ? (
                          <Link
                            to={`/activities/${activity.activityId}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                            onMouseEnter={(e) => { e.target.style.textDecoration = 'underline'; e.target.style.color = 'var(--color-primary-dark)' }}
                            onMouseLeave={(e) => { e.target.style.textDecoration = 'none'; e.target.style.color = 'inherit' }}
                          >
                            {activity.title}
                          </Link>
                        ) : (
                          activity.title
                        )}
                      </p>

                      {/* Sport */}
                      <p style={{ fontSize: '0.9rem' }}>
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
                      <p style={{ fontSize: '0.85rem' }}>
                        {activity.time}
                      </p>

                      {/* Location */}
                      <p style={{ fontSize: '0.85rem' }}>
                        {activity.location}
                      </p>

                      {/* Spots */}
                      <p style={{ fontSize: '0.85rem' }}>
                        {spotsLeft} spots left
                      </p>

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
                          variant={isAttending ? 'ghost' : 'primary'}
                          // Disable when the schedule is full AND the
                          // user isn't already attending. Attendees
                          // can still leave a full session.
                          disabled={!isAttending && isFull}
                          style={{ marginTop: '8px' }}
                          onClick={() => handleToggleAttendance(activity)}
                        >
                          {isAttending
                            ? 'Leave'
                            : (isFull ? 'Full' : 'Attend')}
                        </Button>
                      )}

                    </div>
                    )
          })}

                </div>
              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}