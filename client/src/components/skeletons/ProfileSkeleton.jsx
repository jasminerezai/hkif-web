// Skeleton placeholder for /profile.
//
// Mirrors the real ProfilePage layout so the page doesn't visually
// jump when /api/users/me resolves. Sections rendered:
//   1. Hero / user card     — always
//   2. Manage Activities    — only if canManage (ADMIN / BOARD_MEMBER)
//   3. Upcoming Activities  — always
//   4. Favorite Activities  — always
//
// Why a single page-level skeleton instead of one-per-section:
//   The hero + upcoming + favorites all land together when
//   /api/users/me resolves, so splitting the file would just add
//   import boilerplate without a real win.
//
// We also export ManageActivitiesGridSkeleton because the manage
// list is fetched independently from the main profile call (see
// ProfilePage's second useEffect), so the rest of the page can
// already be visible while the management grid is still in flight.

import React from 'react'
import { Card, Skeleton } from '../ui'

// ── Section heading placeholder ────────────────────────────────
// Small helper so all three section titles look identical and we
// only have to tweak one place if the typography changes.
function SectionHeadingSkeleton() {
  return (
    <Skeleton
      height="1.5rem"
      width="35%"
      style={{ marginBottom: '16px' }}
    />
  )
}

// ── Hero card placeholder ──────────────────────────────────────
// Mirrors the green user card at the top of the profile: large
// name, email line, role badge pill.
function HeroSkeleton() {
  return (
    <Card
      padding="lg"
      shadow="md"
      style={{
        marginBottom: '32px',
        background: 'var(--color-primary-light)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Name — h1 sized */}
      <Skeleton
        height="2.5rem"
        width="40%"
        style={{ marginBottom: '8px' }}
      />

      {/* Email — muted text line */}
      <Skeleton
        height="1rem"
        width="30%"
        style={{ marginBottom: '12px' }}
      />

      {/* Role pill — width chosen to roughly match a BOARD_MEMBER badge */}
      <Skeleton height="1.4rem" width="120px" radius="full" />
    </Card>
  )
}

// ── Manage Activities grid placeholder ─────────────────────────
// Exported so ProfilePage can also use it for the secondary
// `manageLoading` state (when the rest of the page is already
// painted but the manage list is still in flight).
//
// count default of 3 fits one row on most viewports — same logic
// as ActivityListSkeleton's default of 4 (enough to feel populated,
// not so many we waste DOM nodes).
export function ManageActivitiesGridSkeleton({ count = 3 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          padding="md"
          shadow="sm"
          style={{ position: 'relative' }}
        >
          {/* Pen icon placeholder — top-right circle. Mirrors the
              ✎ button on the real card. */}
          <Skeleton
            radius="full"
            width="24px"
            height="24px"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
            }}
          />

          {/* Card title — leaves room for the pen */}
          <Skeleton
            height="1.3rem"
            width="60%"
            style={{ marginBottom: '12px' }}
          />

          {/* Location line */}
          <Skeleton
            height="1rem"
            width="50%"
            style={{ marginBottom: '16px' }}
          />

          {/* Edit Activity button placeholder */}
          <Skeleton height="2rem" width="120px" radius="sm" />
        </Card>
      ))}
    </div>
  )
}

// ── Upcoming Activities grid placeholder ───────────────────────
// Compact cards — real version is just name + date, so the
// skeleton is intentionally short to avoid over-rendering.
function UpcomingGridSkeleton({ count = 3 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} padding="md" shadow="sm">
          <Skeleton
            height="1.2rem"
            width="65%"
            style={{ marginBottom: '8px' }}
          />
          <Skeleton height="1rem" width="45%" />
        </Card>
      ))}
    </div>
  )
}

// ── Favorite Activities grid placeholder ───────────────────────
// Tallest of the three section types — real favorites card has
// name, description, location, and a Remove button.
function FavoritesGridSkeleton({ count = 3 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} padding="md" shadow="sm">
          <Skeleton
            height="1.3rem"
            width="60%"
            style={{ marginBottom: '10px' }}
          />

          {/* Description — two lines of muted text */}
          <Skeleton height="1rem" style={{ marginBottom: '6px' }} />
          <Skeleton
            height="1rem"
            width="80%"
            style={{ marginBottom: '14px' }}
          />

          {/* Location line */}
          <Skeleton
            height="1rem"
            width="55%"
            style={{ marginBottom: '16px' }}
          />

          {/* Remove Favorite button placeholder */}
          <Skeleton height="2rem" width="140px" radius="sm" />
        </Card>
      ))}
    </div>
  )
}

// ── Default export: full page skeleton ─────────────────────────
// Props:
//   canManage — when true, also renders the Manage Activities
//               section so the layout matches what the user is
//               about to see. Passed in from ProfilePage which
//               already computes it from user.role.
export default function ProfileSkeleton({ canManage = false }) {
  return (
    <div
      style={{
        padding: 'var(--space-6)',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
      aria-busy="true"
      // aria-busy tells assistive tech the region is updating.
      // Individual Skeleton bars are aria-hidden so they don't
      // get announced individually — only this wrapper does.
    >
      <HeroSkeleton />

      {/* Manage section sits above Upcoming when applicable,
          mirroring the real page order for ADMIN / BOARD_MEMBER. */}
      {canManage && (
        <div style={{ marginBottom: '32px' }}>
          <SectionHeadingSkeleton />
          <ManageActivitiesGridSkeleton />
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <SectionHeadingSkeleton />
        <UpcomingGridSkeleton />
      </div>

      <div>
        <SectionHeadingSkeleton />
        <FavoritesGridSkeleton />
      </div>
    </div>
  )
}