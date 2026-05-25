// ChartCard — wraps a recharts chart in a consistent card shell
// with a title and description.
//
// Why this lives in its own file:
//   All three statistics charts use the exact same title +
//   description + spacing treatment. Inlining the markup in each
//   chart component would mean any visual tweak (e.g. tightening
//   the description margin) needs to be made in three places.
//
// Layout assumptions:
//   - children is the chart itself (a recharts <ResponsiveContainer>
//     or an empty-state <p>)
//   - card padding="lg" matches the existing /profile cards so the
//     statistics page feels visually consistent with profile

import React from 'react'
import Card from '../ui/Card.jsx'
import { CHART_COLOR_TEXT_MUTED } from './chartTokens.js'

export default function ChartCard({
  title,
  description,
  children,
}) {
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
          color:        CHART_COLOR_TEXT_MUTED,
          marginBottom: '20px',
        }}
      >
        {description}
      </p>

      {children}

    </Card>
  )
}