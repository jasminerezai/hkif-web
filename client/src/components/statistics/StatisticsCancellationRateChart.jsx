// StatisticsCancellationRateChart — horizontal red bar chart
// showing cancellation rate (%) per activity, sorted worst-first.
//
// Red bars (danger token) signal "higher = bigger problem" so the
// chart reads at a glance without needing to interpret the
// numbers — the worst offenders stand out by color alone.

import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

import ChartCard from './ChartCard.jsx'
import {
  CHART_COLOR_BAR_DANGER,
  CHART_COLOR_TEXT_MUTED,
  CHART_COLOR_GRID,
} from './chartTokens.js'


export default function StatisticsCancellationRateChart({
  perActivity,
}) {

  const chartData = useMemo(() => {

    if (!perActivity) return []

    // Filter out activities with zero schedules — a "0%
    // cancellation rate from 0 schedules" row is misleading
    // (you can't cancel what was never scheduled). Sort
    // descending to put the worst offenders at the top.
    return perActivity
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

  }, [perActivity])


  return (

    <ChartCard
      title="Cancellation Rate per Activity"
      description={
        'Percentage of cancelled schedules per activity.' +
        ' Sorted highest → lowest. Activities with no' +
        ' schedules are hidden.'
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
          No schedule data yet.
        </p>

      ) : (

        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLOR_GRID}
            />

            <XAxis
              type="number"
              stroke={CHART_COLOR_TEXT_MUTED}
              domain={[0, 100]}
              unit="%"
            />

            <YAxis
              dataKey="name"
              type="category"
              stroke={CHART_COLOR_TEXT_MUTED}
              width={140}
            />

            <Tooltip
              formatter={(value) => `${value}%`}
            />

            {/* Single Bar with a Cell for each row so each bar
                can be coloured identically with the danger token.
                We could just pass `fill` on the Bar, but using
                Cells leaves the door open to e.g. highlighting
                rows above a threshold later. */}
            <Bar
              dataKey="Cancellation %"
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLOR_BAR_DANGER}
                />
              ))}
            </Bar>

          </BarChart>
        </ResponsiveContainer>
      )}

    </ChartCard>
  )
}