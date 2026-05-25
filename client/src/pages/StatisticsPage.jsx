// /admin/statistics
//
// Admin-only dashboard. Thin container that:
//   - fetches GET /api/admin/statistics
//   - manages loading / refreshing / error state
//   - lays out: header → KPI tiles → 3 charts
//   - handles "Last updated X ago" stamp + manual refresh
//   - handles CSV export
//
// All chart rendering + data shaping lives in subcomponents under
// components/statistics/ — this file should stay focused on data
// flow and layout.
//
// Role gate is enforced in App.jsx via <ProtectedRoute requiredRoles=
// {[ROLES.ADMIN]}>. The backend also restricts to ADMIN — the route
// guard just prevents the page from mounting and firing a doomed
// request for non-admins.

import React, { useEffect, useState } from 'react'

import { useAuth } from '../context/AuthContext.jsx'
import { useNowTick } from '../hooks/useNowTick.js'
import {
  fetchAdminStatistics,
} from '../services/AdminStatisticsService.js'
import { AuthExpiredError } from '../services/AuthExpiredError.js'

import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import StatisticsSkeleton from
  '../components/skeletons/StatisticsSkeleton.jsx'

import StatisticsKpiTiles from
  '../components/statistics/StatisticsKpiTiles.jsx'
import StatisticsPopularActivitiesChart from
  '../components/statistics/StatisticsPopularActivitiesChart.jsx'
import StatisticsParticipantsPerActivityChart from
  '../components/statistics/StatisticsParticipantsPerActivityChart.jsx'
import StatisticsCancellationRateChart from
  '../components/statistics/StatisticsCancellationRateChart.jsx'


// ── relativeTimeFrom ──────────────────────────────────────────
// Returns a short human string for "how long ago was this Date?".
// Used by the "Last updated X ago" label in the header.
//
// Kept outside the component so it doesn't get redefined on every
// render. No external library needed — the granularity we want
// (just-now / minutes / hours) is trivial to compute by hand.
function relativeTimeFrom(date) {

  if (!date) return ''

  const seconds =
    Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 10)   return 'just now'
  if (seconds < 60)   return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)   return `${minutes} min ago`

  const hours   = Math.floor(minutes / 60)
  if (hours < 24)     return `${hours}h ago`

  const days    = Math.floor(hours / 24)
  return `${days}d ago`
}


/**
 * Build a CSV string from an admin statistics response.
 *
 * Joins the three data tables in the stats object by activityId
 * into a single per-activity row, so the export is one merged
 * spreadsheet rather than three files. Rows mirror the order of
 * `mostPopularActivities`, which the backend pre-sorts by
 * participants desc → favorites desc.
 *
 * The output has SIX columns in this exact order:
 *
 *   1. Activity              — activity name (string, escaped for
 *                              commas / quotes / newlines)
 *   2. Participants          — integer, from mostPopularActivities
 *   3. Favorites             — integer, from mostPopularActivities
 *   4. Total Schedules       — integer, from cancellationRates
 *                              (0 if the activity has no schedule
 *                              record at all)
 *   5. Cancelled Schedules   — integer, from cancellationRates
 *                              (0 if no schedule record)
 *   6. Cancellation Rate (%) — number with 1 decimal place, e.g.
 *                              "12.5". Computed as
 *                              cancellationRate * 100, since the
 *                              backend returns a 0..1 ratio.
 *                              "0.0" if no schedule record.
 *
 * !!! Keep this column order + header text stable !!!
 * Downstream users may have spreadsheets, pivot tables, or scripts
 * that reference these columns by position or name. If you add a
 * column, append it at the end. If you rename one, coordinate with
 * whoever's consuming the export.
 *
 * @param   {object} stats — the `data` field from
 *                           GET /api/admin/statistics
 * @returns {string}         CSV text, or '' if stats is missing
 */
function buildCsv(stats) {

  if (!stats) return ''

  const {
    mostPopularActivities,
    cancellationRates,
  } = stats

  // Index cancellation data by activityId so we can attach it to
  // each popular-activity row in O(n) total instead of a nested
  // find() (which would be O(n²) on each export).
  const cancellationByActivityId = new Map()

  for (const row of cancellationRates.perActivity) {
    cancellationByActivityId.set(row.activityId, row)
  }

  // Header text. See JSDoc above for the column contract.
  const header = [
    'Activity',
    'Participants',
    'Favorites',
    'Total Schedules',
    'Cancelled Schedules',
    'Cancellation Rate (%)',
  ]

  const rows = mostPopularActivities.map(activity => {

    const cancellation =
      cancellationByActivityId.get(activity.activityId)

    return [
      activity.activityName,
      activity.participantCount,
      activity.favoriteCount,
      cancellation?.totalSchedules     ?? 0,
      cancellation?.cancelledSchedules ?? 0,

      // toFixed(1) keeps the column tidy in Excel — "12.5"
      // rather than "12.4999999...". Multiply by 100 here
      // because the backend returns a 0..1 ratio.
      cancellation
        ? (cancellation.cancellationRate * 100).toFixed(1)
        : '0.0',
    ]
  })

  // Escape any cells that contain a comma, quote, or newline by
  // wrapping in double quotes and doubling any embedded quotes.
  // Standard CSV rule — without this an activity name with a
  // comma in it (e.g. "Yoga, Beginner") would break the columns.
  function escapeCell(cell) {

    const str = String(cell ?? '')

    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }

    return str
  }

  return [header, ...rows]
    .map(row => row.map(escapeCell).join(','))
    .join('\n')
}


// ── downloadCsv ───────────────────────────────────────────────
// Browser-side download trigger. Creates a Blob URL, attaches it
// to an off-DOM anchor, and clicks it. Standard technique — no
// extra deps. Falls back gracefully if the browser doesn't
// support the download attribute (the file just opens in a new
// tab, still usable).
function downloadCsv(csv, filename) {

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url  = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href     = url
  link.download = filename

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Free the blob URL — browsers don't auto-revoke these.
  URL.revokeObjectURL(url)
}


// ── StatisticsPage (container) ────────────────────────────────
export default function StatisticsPage() {

  // ── Auth ────────────────────────────────────────────────────
  const { token } = useAuth()
  // No user lookup needed — the route gate in App.jsx already
  // guarantees we have an ADMIN at this point.

  // ── State ───────────────────────────────────────────────────
  const [stats,       setStats]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [refreshing,  setRefreshing]  = useState(false)
  const [error,       setError]       = useState(null)

  // Timestamp of the most recent successful fetch. Drives the
  // "Last updated X ago" label.
  const [lastUpdated, setLastUpdated] = useState(null)

  // Schedule a re-render every 30s so the relative-time label
  // stays fresh even when no data changes. The hook hides the
  // unused-state plumbing that used to require an eslint-disable.
  useNowTick(30_000)


  // ── Fetch ───────────────────────────────────────────────────
  // Single loader function — called once on mount and again every
  // time the user clicks "Refresh". Two booleans separate the
  // initial load (shows skeleton) from a manual refresh (keeps
  // the existing chart on screen, just dims the buttons).
  async function loadStatistics({ isRefresh = false } = {}) {

    if (!token) return

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError(null)

    try {

      const { data } = await fetchAdminStatistics(token)

      setStats(data)
      setLastUpdated(new Date())

    } catch (err) {

      if (err instanceof AuthExpiredError) {

        // Token rejected — fall through to the error card. A real
        // app would clear the session here via useAuthExpired-
        // Handler; leaving that to the existing global handler
        // on the next protected route the user lands on.
        setError('Your session has expired. Please log in again.')

      } else {

        console.error('Failed to load admin statistics:', err)
        setError('Failed to load statistics.')
      }

    } finally {

      setLoading(false)
      setRefreshing(false)
    }
  }


  // Initial load on mount. Deliberately narrow dep array (token
  // only) — refresh is user-initiated, not effect-driven, to
  // avoid loops where setLastUpdated → re-run effect.
  useEffect(() => {

    loadStatistics()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])


  // ── Handlers ────────────────────────────────────────────────
  function handleRefresh() {
    loadStatistics({ isRefresh: true })
  }

  function handleExportCsv() {

    const csv      = buildCsv(stats)
    const stamp    = new Date().toISOString().slice(0, 10)
    // ISO date prefix on the filename so multiple exports on the
    // same day don't all collide as "hkif-statistics.csv".
    // Format: hkif-statistics-2026-05-23.csv
    const filename = `hkif-statistics-${stamp}.csv`

    downloadCsv(csv, filename)
  }


  // ── Loading state ───────────────────────────────────────────
  if (loading) {
    return <StatisticsSkeleton />
  }


  // ── Error state ─────────────────────────────────────────────
  if (error) {
    return (
      <div
        style={{
          padding:  'var(--space-6)',
          maxWidth: '1100px',
          margin:   '0 auto',
        }}
      >
        <Card padding="lg">

          <p style={{ marginBottom: '16px' }}>{error}</p>

          <Button
            variant="primary"
            onClick={() => loadStatistics()}
          >
            Try Again
          </Button>

        </Card>
      </div>
    )
  }


  // ── Render ──────────────────────────────────────────────────
  return (

    <div
      style={{
        padding:  'var(--space-6)',
        maxWidth: '1100px',
        margin:   '0 auto',
      }}
    >

      {/* ── Header row ──────────────────────────────────────── */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginBottom:   '24px',
          flexWrap:       'wrap',
          gap:            '12px',
        }}
      >

        <div>

          <h1
            style={{
              fontSize:     '2rem',
              marginBottom: '4px',
            }}
          >
            Statistics Dashboard
          </h1>

          {/* Live relative-time label. Re-renders every 30s via
              useNowTick above. */}
          <p
            style={{
              fontSize: '0.9rem',
              color:    'var(--color-text-muted)',
            }}
          >
            Last updated{' '}
            <strong>{relativeTimeFrom(lastUpdated)}</strong>
            {lastUpdated && (
              <>
                {' '}
                · {lastUpdated.toLocaleTimeString()}
              </>
            )}
          </p>

        </div>

        {/* Action buttons. Disabled while refreshing so the user
            can't double-click and queue two requests. */}
        <div
          style={{
            display:  'flex',
            gap:      '8px',
            flexWrap: 'wrap',
          }}
        >

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>

        </div>

      </div>


      {/* ── KPI tiles ───────────────────────────────────────── */}
      <StatisticsKpiTiles stats={stats} />


      {/* ── Charts ──────────────────────────────────────────── */}
      <StatisticsPopularActivitiesChart
        mostPopularActivities={stats.mostPopularActivities}
      />

      <StatisticsParticipantsPerActivityChart
        totalParticipantsPerActivity={
          stats.totalParticipantsPerActivity
        }
      />

      <StatisticsCancellationRateChart
        perActivity={stats.cancellationRates.perActivity}
      />

    </div>
  )
}