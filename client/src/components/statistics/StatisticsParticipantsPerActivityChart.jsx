// StatisticsParticipantsPerActivityChart — vertical bar chart
// of every activity's total participant count, sorted descending.
//
// Complements the "Most Popular" chart by showing the long tail:
// that chart caps at top 10, this one includes everything.

import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import ChartCard from './ChartCard.jsx'
import {
  CHART_COLOR_BAR_PRIMARY,
  CHART_COLOR_TEXT_MUTED,
  CHART_COLOR_GRID,
} from './chartTokens.js'


export default function StatisticsParticipantsPerActivityChart({
  totalParticipantsPerActivity,
}) {

  const chartData = useMemo(() => {

    if (!totalParticipantsPerActivity) return []

    // Sort descending so the bar chart reads left → right by
    // popularity. Backend doesn't pre-sort this array (only
    // mostPopularActivities is sorted server-side).
    return [...totalParticipantsPerActivity]
      .sort((a, b) => b.participantCount - a.participantCount)
      .map(activity => ({
        name:         activity.activityName,
        Participants: activity.participantCount,
      }))

  }, [totalParticipantsPerActivity])


  return (

    <ChartCard
      title="Participants per Activity"
      description={
        'Total participant count across all schedules for' +
        ' each activity.'
      }
    >

      {chartData.length === 0 ? (

        <p
          style={{
            color:     CHART_COLOR_TEXT_MUTED,
            padding:   '40px 0',
            textAlign: 'center',
          }}
        >
          No participation data yet.
        </p>

      ) : (

        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 24, left: 8, bottom: 48 }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLOR_GRID}
            />

            {/* Rotated labels because activity names tend to be
                long enough that horizontal labels would overlap.
                -25° is readable without taking too much vertical
                space. */}
            <XAxis
              dataKey="name"
              stroke={CHART_COLOR_TEXT_MUTED}
              angle={-25}
              textAnchor="end"
              height={60}
              interval={0}
            />

            <YAxis stroke={CHART_COLOR_TEXT_MUTED} />

            <Tooltip />

            <Bar
              dataKey="Participants"
              fill={CHART_COLOR_BAR_PRIMARY}
              radius={[4, 4, 0, 0]}
            />

          </BarChart>
        </ResponsiveContainer>
      )}

    </ChartCard>
  )
}