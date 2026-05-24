// useNowTick — force a re-render every `intervalMs` milliseconds.
//
// Use case: components that display a *relative* time string like
// "Last updated 2 min ago". The underlying timestamp doesn't change,
// but the rendered text needs to age — without an external nudge,
// React would never re-run the component and the label would stay
// frozen at "just now" forever.
//
// USAGE:
//   function StatisticsPage() {
//     useNowTick(30_000)            // re-render every 30s
//     return <p>Last updated {relativeTimeFrom(lastUpdated)}</p>
//   }
//
// Why a hook (instead of an unused `nowTick` state in the page):
//   The previous implementation kept a useState whose VALUE was never
//   read — only the act of calling setNowTick() forced React to
//   re-render. That triggered `no-unused-vars` and required an
//   eslint-disable comment. Hiding the state inside a hook makes
//   the intent obvious from the call site ("we want a tick") and
//   removes the lint suppression from the page.
//
// Internally we still use useState, but we deliberately discard
// the value with `[, setTick]` — the lint rule is happy because
// it's the destructured slot that's empty, not an unused variable.

import { useEffect, useState } from 'react'

export function useNowTick(intervalMs = 30_000) {

  // Empty first slot — we only need the setter to schedule
  // re-renders. The current tick value isn't useful to anyone.
  const [, setTick] = useState(0)

  useEffect(() => {

    const id = setInterval(() => {
      // Functional update so we don't depend on a captured `tick`
      // value. Lets us keep the dep array minimal.
      setTick(t => t + 1)
    }, intervalMs)

    // Always clear on unmount — otherwise a user navigating away
    // from /admin/statistics would leave a timer alive in the
    // background, holding a closure reference to setTick forever.
    return () => clearInterval(id)

  }, [intervalMs])
}