// Skeleton placeholder for the single-activity detail page.
//
// NOTE: the activity detail page (route /activities/:id) is still
// a stub in App.jsx as of #30. This component is delivered now so
// whoever picks up the detail page ticket can drop it in without
// having to design loading states from scratch.
//
// Expected usage once the detail page exists:
//
//   if (loading) return <ActivityDetailSkeleton />
//   return <div>...real content...</div>
//
// Layout is a best-guess at the eventual shape: large title,
// metadata row, description block, time-slot list, action buttons.
// If the real page diverges, update this file to match.

import React from 'react'
import { Card, Skeleton } from '../ui'

export default function ActivityDetailSkeleton() {
  return (
    <div
      style={{
        padding:  'var(--space-6)',
        maxWidth: '800px',
        margin:   '0 auto',
      }}
    >
      {/* Large page title */}
      <Skeleton
        height="2.4rem"
        width="65%"
        style={{ marginBottom: 'var(--space-6)' }}
      />

      {/* Meta row — location / capacity / status side-by-side */}
      <div
        style={{
          display:      'flex',
          gap:          'var(--space-4)',
          marginBottom: 'var(--space-6)',
          flexWrap:     'wrap',
        }}
      >
        <Skeleton height="1.2rem" width="100px" />
        <Skeleton height="1.2rem" width="120px" />
        <Skeleton height="1.2rem" width="80px"  />
      </div>

      {/* Description card — multi-line text block */}
      <Card padding="md" shadow="sm" style={{ marginBottom: 'var(--space-6)' }}>
        <Skeleton height="1.4rem" width="30%" style={{ marginBottom: 'var(--space-4)' }} />

        <Skeleton height="1rem" style={{ marginBottom: 'var(--space-2)' }} />
        <Skeleton height="1rem" style={{ marginBottom: 'var(--space-2)' }} />
        <Skeleton height="1rem" width="75%" />
      </Card>

      {/* Time slots card — title + repeating slot rows */}
      <Card padding="md" shadow="sm" style={{ marginBottom: 'var(--space-6)' }}>
        <Skeleton height="1.4rem" width="25%" style={{ marginBottom: 'var(--space-4)' }} />

        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            height="1rem"
            width="60%"
            style={{ marginBottom: 'var(--space-2)' }}
          />
        ))}
      </Card>

      {/* Action buttons — "Attend" / "Edit" etc. */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Skeleton height="2.5rem" width="100px" radius="sm" />
        <Skeleton height="2.5rem" width="100px" radius="sm" />
      </div>
    </div>
  )
}