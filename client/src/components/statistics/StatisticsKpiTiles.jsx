// StatisticsKpiTiles — the four metric cards across the top of
// the statistics dashboard.
//
// Receives the raw stats object from the container and computes
// the four totals internally. Moving the calculation out of the
// container keeps StatisticsPage focused on data fetching +
// layout, and means the KPI logic lives next to the markup that
// renders it.
//
// Why one component for all four tiles instead of four KpiTile
// children:
//   The grid container + responsive breakpoints are shared.
//   Splitting per-tile would force the parent to know about
//   grid layout for tiles specifically. Keeping the grid +
//   tiles together makes this self-contained.

import React, { useMemo } from 'react'
import Card from '../ui/Card.jsx'
import { CHART_COLOR_TEXT_MUTED } from './chartTokens.js'

// ── KpiTile ───────────────────────────────────────────────────
// Inlined here (not exported) because it's only ever used by the
// four tiles in this file. If a second page ever needs the same
// tile shape, promote it to its own file at that point.
function KpiTile({ label, value, hint }) {
  return (
    <Card padding="md" shadow="sm">

      <p
        style={{
          fontSize:      '0.85rem',
          color:         CHART_COLOR_TEXT_MUTED,
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
            fontSize:  '0.8rem',
            color:     CHART_COLOR_TEXT_MUTED,
            marginTop: '4px',
          }}
        >
          {hint}
        </p>
      )}

    </Card>
  )
}


// ── StatisticsKpiTiles ────────────────────────────────────────
export default function StatisticsKpiTiles({ stats }) {

  // useMemo because the totals are summed every render, and the
  // result only changes when `stats` itself changes (which is
  // every refresh, but not on every nowTick re-render).
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

  // Defensive: container only renders this after stats loads,
  // but the null guard means dev refreshes mid-render don't
  // explode if stats is briefly missing.
  if (!kpis) return null

  return (

    <div
      style={{
        display:             'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(180px, 1fr))',
        gap:          '16px',
        marginBottom: '32px',
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
  )
}