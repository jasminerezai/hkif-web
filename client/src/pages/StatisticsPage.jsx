// /admin/statistics
//
// Admin-only dashboard. Visualises aggregate data from
// GET /api/admin/statistics:
//   - 4 KPI tiles at the top
//   - 3 recharts charts below (popular / participants / cancellation)
//
// Extra UX:
//   - "Last updated X ago" stamp + manual refresh button
//   - CSV export of the merged per-activity table
//
// Role gate is enforced in App.jsx via <ProtectedRoute requiredRoles=
// {[ROLES.ADMIN]}>. The backend also restricts to ADMIN — the route
// guard just prevents the page from mounting and firing a doomed
// request for non-admins.

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

import { useAuth } from '../context/AuthContext.jsx'
import {
  fetchAdminStatistics,
} from '../services/AdminStatisticsService.js'
import { AuthExpiredError } from '../services/AuthExpiredError.js'

import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import StatisticsSkeleton from
  '../components/skeletons/StatisticsSkeleton.jsx'


// ── Chart color tokens ─────────────────────────────────────────
// Pulled into named constants so the three charts stay visually
// consistent and so future palette tweaks happen in one place
// instead of scattered across <Bar fill="#..."> props.
// All values are the CSS custom properties already defined in
// index.css — no new colors introduced.
const COLOR_PRIMARY     = 'var(--color-primary)'
const COLOR_PRIMARY_MID = 'var(--color-primary-mid)'
const COLOR_DANGER      = 'var(--color-danger)'
const COLOR_TEXT_MUTED  = 'var(--color-text-muted)'
const COLOR_BORDER      = 'var(--color-border)'


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


// ── buildCsv ──────────────────────────────────────────────────
// Joins the three data tables by activityId into a single
// per-activity row, then serialises to CSV.
//
// Why one merged CSV instead of three separate files:
//   Board-level use case is "give me one spreadsheet I can sort
//   and filter". Three separate files mean three vlookups on
//   their end. Doing the join here makes the export immediately
//   useful in Excel / Google Sheets.
//
// Keeping this as a plain function (not a hook, not a class)
// because it's pure — same inputs → same string.
function buildCsv(stats) {

  if (!stats) return ''

  const {
    mostPopularActivities,
    cancellationRates,
  } = stats

  // Index cancellation data by activityId so we can attach
  // it to each popular-activity row in O(n) total instead of
  // a nested find() (which would be O(n²) on each export).
  const cancellationByActivityId = new Map()

  for (const row of cancellationRates.perActivity) {
    cancellationByActivityId.set(row.activityId, row)
  }

  // CSV header. Keep column names short and snake-case-ish so
  // they're easy to reference in spreadsheet formulas.
  const header = [
    'Activity',
    'Participants',
    'Favorites',
    'Total Schedules',
    'Cancelled Schedules',
    'Cancellation Rate (%)',
  ]

  // Per-row values. `mostPopularActivities` is already pre-sorted
  // by the backend (participants desc, then favorites desc) so
  // the CSV mirrors what the user sees on the dashboard.
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


// ── KpiTile ───────────────────────────────────────────────────
// Small presentational helper for the 4 metric cards across the
// top of the page. Extracted to keep the main JSX block readable
// — without this the tile section would be ~60 lines of repeated
// markup. Inlined render-wise, no separate file needed since
// nothing else uses it.
function KpiTile({ label, value, hint }) {
  return (
    <Card padding="md" shadow="sm">

      <p
        style={{
          fontSize:      '0.85rem',
          color:         COLOR_TEXT_MUTED,
          marginBottom:  '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </p>

      <p
        style={{
          fontSize:   '2rem',
          fontWeight: 700,
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>

      {/* Optional secondary line under the big number — used to
          show e.g. "out of 142 schedules" under the cancellation
          rate so the percentage has context. */}
      {hint && (
        <p
          style={{
            fontSize:    '0.8rem',
            color:       COLOR_TEXT_MUTED,
            marginTop:   '4px',
          }}
        >
          {hint}
        </p>
      )}

    </Card>
  )
}


// ── ChartCard ─────────────────────────────────────────────────
// Wrapper for each chart so the title + description treatment
// stays identical across all three. Children is the actual
// recharts <ResponsiveContainer>.
function ChartCard({ title, description, children }) {
  return (
    <Card
      padding="lg"
      shadow="sm"
      style={{ marginBottom: '24px' }}
    >
      <h2
        style={{
          fontSize:     '1.2rem',
          marginBottom: '4px',
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontSize:     '0.9rem',
          color:        COLOR_TEXT_MUTED,
          marginBottom: '20px',
        }}
      >
        {description}
      </p>

      {children}
    </Card>
  )
}


// ── StatisticsPage ────────────────────────────────────────────
export default function StatisticsPage() {

  // ── Auth ────────────────────────────────────────────────────
  const { token } = useAuth()
  // No useNavigate / user lookup needed here — the route gate in
  // App.jsx already guarantees we have an ADMIN at this point.

  // ── State ───────────────────────────────────────────────────
  const [stats,       setStats]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [refreshing,  setRefreshing]  = useState(false)
  const [error,       setError]       = useState(null)

  // When the most recent successful fetch landed. Drives the
  // "Last updated X ago" label.
  const [lastUpdated, setLastUpdated] = useState(null)

  // Tick state used purely to force a re-render every 30s so the
  // relative-time label stays fresh even when no data changes.
  // We don't actually read `nowTick` — its identity flipping is
  // the whole point.
  // eslint-disable-next-line no-unused-vars
  const [nowTick,     setNowTick]     = useState(0)


  // ── Fetch ───────────────────────────────────────────────────
  // Single loader function — called once on mount and again
  // every time the user clicks "Refresh". Two booleans separate
  // the initial load (shows skeleton) from a manual refresh
  // (keeps the existing chart on screen, just dims the buttons).

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

        // Token rejected — fall through to the error card.
        // A real app would clear the session here via a hook
        // like useAuthExpiredHandler(); leaving that for the
        // existing global handler to pick up on the next
        // protected route the user lands on.
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


  // Initial load on mount. Deliberate empty-ish dep array
  // (token only) — refresh is user-initiated, not effect-driven,
  // to avoid loops where setLastUpdated → re-run effect.
  useEffect(() => {

    loadStatistics()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])


  // Tick every 30s to update the relative-time label.
  // Cleared on unmount — important, otherwise a user navigating
  // away keeps the timer alive in the background.
  useEffect(() => {

    const interval = setInterval(() => {
      setNowTick(t => t + 1)
    }, 30_000)

    return () => clearInterval(interval)
  }, [])


  // ── Derived data ────────────────────────────────────────────
  // useMemo so we don't recompute the chart-shaped arrays on
  // every render — they only change when `stats` changes.

  const popularChartData = useMemo(() => {

    if (!stats) return []

    // Top 10 only. Backend pre-sorts the full list; we cap it
    // here for chart readability — more than ~10 horizontal bars
    // turns the y-axis labels into a wall of text.
    return stats.mostPopularActivities
      .slice(0, 10)
      .map(activity => ({
        name:         activity.activityName,
        Participants: activity.participantCount,
        Favorites:    activity.favoriteCount,
      }))

  }, [stats])


  const participantsChartData = useMemo(() => {

    if (!stats) return []

    // Sort descending so the bar chart reads left → right by
    // popularity. Backend doesn't pre-sort `totalParticipants
    // PerActivity` (that ordering is only applied to
    // `mostPopularActivities`).
    return [...stats.totalParticipantsPerActivity]
      .sort((a, b) => b.participantCount - a.participantCount)
      .map(activity => ({
        name:         activity.activityName,
        Participants: activity.participantCount,
      }))

  }, [stats])


  const cancellationChartData = useMemo(() => {

    if (!stats) return []

    // Filter out activities with zero schedules — a "0%
    // cancellation rate from 0 schedules" row is misleading
    // (you can't cancel what was never scheduled). Sort
    // descending to put the worst offenders at the top.
    return stats.cancellationRates.perActivity
      .filter(row => row.totalSchedules > 0)
      .sort((a, b) => b.cancellationRate - a.cancellationRate)
      .map(row => ({
        name:               row.activityName,
        'Cancellation %':   Number(
                              (row.cancellationRate * 100).toFixed(1)
                            ),
        totalSchedules:     row.totalSchedules,
        cancelledSchedules: row.cancelledSchedules,
      }))

  }, [stats])


  // ── KPI tile values ─────────────────────────────────────────
  // useMemo to keep the totals stable across re-renders that
  // aren't related to a data change (e.g. the 30s timer tick).

  const kpis = useMemo(() => {

    if (!stats) return null

    const totalParticipants = stats
      .totalParticipantsPerActivity
      .reduce((sum, row) => sum + row.participantCount, 0)

    const totalFavorites = stats
      .mostPopularActivities
      .reduce((sum, row) => sum + row.favoriteCount, 0)

    return {
      totalActivities:    stats.totalParticipantsPerActivity.length,
      totalParticipants,
      totalFavorites,
      overallCancellation:
        (stats.cancellationRates.overallRate * 100).toFixed(1),
      totalSchedules:
        stats.cancellationRates.totalSchedules,
      cancelledSchedules:
        stats.cancellationRates.cancelledSchedules,
    }

  }, [stats])


  // ── Handlers ────────────────────────────────────────────────
  function handleRefresh() {
    loadStatistics({ isRefresh: true })
  }

  function handleExportCsv() {

    const csv      = buildCsv(stats)
    const stamp    = new Date().toISOString().slice(0, 10)
    // ISO date prefix on the filename so multiple exports on
    // the same day don't all collide as "hkif-statistics.csv".
    // Format: hkif-statistics-2026-05-23.csv
    const filename = `hkif-statistics-${stamp}.csv`

    downloadCsv(csv, filename)
  }


  // ── Loading state ───────────────────────────────────────────
  // Renders the full page shape as shimmering placeholders so
  // the layout doesn't jump when /api/admin/statistics resolves.
  // Same pattern as ProfilePage's loading state.
  if (loading) {
    return <StatisticsSkeleton />
  }


  // ── Error state ─────────────────────────────────────────────
  // Plain card with a retry button. Matches the simple
  // error treatment on /profile.
  if (error) {
    return (
      <div
        style={{
          padding:   'var(--space-6)',
          maxWidth:  '1100px',
          margin:    '0 auto',
        }}
      >
        <Card padding="lg">

          <p style={{ marginBottom: '16px' }}>{error}</p>

          {/* Retry only makes sense for non-auth errors, but
              we offer it anyway — if it really was a token
              issue, the next attempt will just re-fail with
              the same message, no harm done. */}
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

          {/* Live relative-time label. Re-renders every 30s
              via the nowTick effect above. */}
          <p
            style={{
              fontSize: '0.9rem',
              color:    COLOR_TEXT_MUTED,
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

        {/* Action buttons. Disabled while refreshing so the
            user can't double-click and queue two requests. */}
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
      <div
        style={{
          display:             'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap:           '16px',
          marginBottom:  '32px',
        }}
      >

        <KpiTile
          label="Activities"
          value={kpis.totalActivities}
        />

        <KpiTile
          label="Total Participants"
          value={kpis.totalParticipants}
        />

        <KpiTile
          label="Total Favorites"
          value={kpis.totalFavorites}
        />

        <KpiTile
          label="Cancellation Rate"
          value={`${kpis.overallCancellation}%`}
          hint={
            `${kpis.cancelledSchedules} of ` +
            `${kpis.totalSchedules} schedules`
          }
        />

      </div>


      {/* ── Chart 1: Most Popular Activities ─────────────────
          Horizontal grouped bar chart — participants vs
          favorites side-by-side per activity, top 10 only.
          Horizontal layout lets long activity names sit on the
          y-axis without rotating. */}
      <ChartCard
        title="Most Popular Activities"
        description={
          'Top 10 activities by participation, with favorites' +
          ' shown for comparison.'
        }
      >

        {popularChartData.length === 0 ? (

          <p
            style={{
              color:     COLOR_TEXT_MUTED,
              padding:   '40px 0',
              textAlign: 'center',
            }}
          >
            No activity data yet.
          </p>

        ) : (

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={popularChartData}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={COLOR_BORDER}
              />

              {/* For layout="vertical", X is the numeric axis
                  and Y holds the category labels. */}
              <XAxis
                type="number"
                stroke={COLOR_TEXT_MUTED}
              />

              <YAxis
                dataKey="name"
                type="category"
                stroke={COLOR_TEXT_MUTED}
                width={140}
              />

              <Tooltip />
              <Legend />

              <Bar
                dataKey="Participants"
                fill={COLOR_PRIMARY}
                radius={[0, 4, 4, 0]}
              />

              <Bar
                dataKey="Favorites"
                fill={COLOR_PRIMARY_MID}
                radius={[0, 4, 4, 0]}
              />

            </BarChart>
          </ResponsiveContainer>
        )}

      </ChartCard>


      {/* ── Chart 2: Participants per Activity ───────────────
          Standard vertical bar chart of all activities sorted
          by participant count. Complements chart 1 by showing
          the long tail — chart 1 only shows top 10. */}
      <ChartCard
        title="Participants per Activity"
        description={
          'Total participant count across all schedules for' +
          ' each activity.'
        }
      >

        {participantsChartData.length === 0 ? (

          <p
            style={{
              color:     COLOR_TEXT_MUTED,
              padding:   '40px 0',
              textAlign: 'center',
            }}
          >
            No participation data yet.
          </p>

        ) : (

          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={participantsChartData}
              margin={{ top: 8, right: 24, left: 8, bottom: 48 }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={COLOR_BORDER}
              />

              {/* Rotated labels because activity names tend to
                  be long enough that horizontal labels would
                  overlap. -25° is a good compromise — readable
                  without taking too much vertical space. */}
              <XAxis
                dataKey="name"
                stroke={COLOR_TEXT_MUTED}
                angle={-25}
                textAnchor="end"
                height={60}
                interval={0}
              />

              <YAxis stroke={COLOR_TEXT_MUTED} />

              <Tooltip />

              <Bar
                dataKey="Participants"
                fill={COLOR_PRIMARY}
                radius={[4, 4, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>
        )}

      </ChartCard>


      {/* ── Chart 3: Cancellation Rate ───────────────────────
          Horizontal bar chart. Bars are coloured red to signal
          "the higher the bar, the bigger the problem" — using
          the danger token instead of the primary green. */}
      <ChartCard
        title="Cancellation Rate per Activity"
        description={
          'Percentage of cancelled schedules per activity.' +
          ' Sorted highest → lowest. Activities with no' +
          ' schedules are hidden.'
        }
      >

        {cancellationChartData.length === 0 ? (

          <p
            style={{
              color:     COLOR_TEXT_MUTED,
              padding:   '40px 0',
              textAlign: 'center',
            }}
          >
            No schedule data yet.
          </p>

        ) : (

          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={cancellationChartData}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={COLOR_BORDER}
              />

              <XAxis
                type="number"
                stroke={COLOR_TEXT_MUTED}
                domain={[0, 100]}
                unit="%"
              />

              <YAxis
                dataKey="name"
                type="category"
                stroke={COLOR_TEXT_MUTED}
                width={140}
              />

              <Tooltip
                formatter={(value) => `${value}%`}
              />

              {/* Single Bar with a Cell for each row so each bar
                  can be coloured identically with the danger
                  token. We could just pass `fill` on the Bar,
                  but using Cells leaves the door open to e.g.
                  highlighting rows above a threshold later. */}
              <Bar
                dataKey="Cancellation %"
                radius={[0, 4, 4, 0]}
              >
                {cancellationChartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLOR_DANGER}
                  />
                ))}
              </Bar>

            </BarChart>
          </ResponsiveContainer>
        )}

      </ChartCard>

    </div>
  )
}