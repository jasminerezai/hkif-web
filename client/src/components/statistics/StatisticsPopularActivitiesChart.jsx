// StatisticsPopularActivitiesChart — top 10 activities by
// participation, with favorites shown side-by-side for comparison.
//
// Horizontal grouped bar chart. Horizontal layout lets long
// activity names sit on the y-axis without rotating.
//
// Data shaping is done in here (not in the container) so this
// component is self-contained — caller passes the raw
// mostPopularActivities array, the component handles everything
// else.

import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import ChartCard from './ChartCard.jsx'
import {
  CHART_COLOR_BAR_PRIMARY,
  CHART_COLOR_BAR_SECONDARY,
  CHART_COLOR_TEXT_MUTED,
  CHART_COLOR_GRID,
} from './chartTokens.js'


export default function StatisticsPopularActivitiesChart({
  mostPopularActivities,
}) {

  // useMemo so we don't reshape the array on every nowTick render
  // (every 30s). Only recomputes when the underlying data changes.
  const chartData = useMemo(() => {

    if (!mostPopularActivities) return []

    // Top 10 only. Backend pre-sorts the full list; we cap it
    // here for chart readability — more than ~10 horizontal bars
    // turns the y-axis labels into a wall of text.
    return mostPopularActivities
      .slice(0, 10)
      .map(activity => ({
        name:         activity.activityName,
        Participants: activity.participantCount,
        Favorites:    activity.favoriteCount,
      }))

  }, [mostPopularActivities])


  return (

    <ChartCard
      title="Most Popular Activities"
      description={
        'Top 10 activities by participation, with favorites' +
        ' shown for comparison.'
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
          No activity data yet.
        </p>

      ) : (

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLOR_GRID}
            />

            {/* For layout="vertical", X is the numeric axis
                and Y holds the category labels. */}
            <XAxis
              type="number"
              stroke={CHART_COLOR_TEXT_MUTED}
            />

            <YAxis
              dataKey="name"
              type="category"
              stroke={CHART_COLOR_TEXT_MUTED}
              width={140}
            />

            <Tooltip />
            <Legend />

            <Bar
              dataKey="Participants"
              fill={CHART_COLOR_BAR_PRIMARY}
              radius={[0, 4, 4, 0]}
            />

            <Bar
              dataKey="Favorites"
              fill={CHART_COLOR_BAR_SECONDARY}
              radius={[0, 4, 4, 0]}
            />

          </BarChart>
        </ResponsiveContainer>
      )}

    </ChartCard>
  )
}