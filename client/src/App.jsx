import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import Navbar from './components/Navbar.jsx'
import ActivitiesPage from './pages/ActivitiesPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ActivityFormPage from './pages/ActivityFormPage.jsx'
import SchedulePage from './pages/SchedulePage.jsx'
import ActivityDetailPage from './pages/ActivityDetailPage.jsx'
import { MANAGER_ROLES, EDITOR_ROLES } from './constants/roles.js'
import NotFoundPage from './pages/NotFoundPage.jsx'

// ── ProtectedRoute ────────────────────────────────────────────
// Wraps any route that requires login, and optionally a specific role.
//
// Props:
//   children       — the page component to render when access is granted
//   requiredRoles  — optional array of role names. If passed, the user's
//                    role must be in the list to access the route.
//                    Leave undefined for "logged-in only, any role".
//
// Redirects:
//   Still rehydrating         → spinner (no redirect yet)
//   Not logged in             → /login (preserves blocked URL)
//   Logged in but no role     → /login (treat as broken session)
//   Logged in, wrong role     → / (home)
//
// Note: backend role middleware is the real enforcement layer — this
// guard just prevents the page from mounting client-side so we avoid
// pointless fetches and dead-end "no permission" screens.
function ProtectedRoute({ children, requiredRoles }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    // Still checking localStorage — don't redirect yet.
    // Without this check, a logged-in user would be briefly
    // redirected to /login on every page refresh.
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{
          width: '32px', height: '32px',
          border: '3px solid #d8d8d8',
          borderTopColor: '#5a9e1f',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Not logged in (or token was rejected during rehydration).
    // Preserve the blocked URL so LoginPage can return them here.
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  // Defensive: if a route requires a role but the user object somehow
  // doesn't have one, treat the session as broken and force a fresh
  // login. Better than silently bouncing the user to home with no
  // explanation (which is what `requiredRoles.includes(undefined)`
  // would produce).
  if (requiredRoles && !user?.role) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  // Logged in, but with the wrong role for this route.
  // Bounce to home rather than showing an inline error page.
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

// ── Placeholder pages ─────────────────────────────────────────
// Replace these one by one as you build the real pages.
function Placeholder({ title }) {
  const { isAuthenticated, user, logout } = useAuth()
  return (
    <div style={{ padding: '48px 24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', marginBottom: '12px', color: '#1a1a1a' }}>
        {title}
      </h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>This page is coming soon.</p>
      {isAuthenticated && (
        <div style={{ background: '#eaf3de', border: '1px solid #c0dea0', borderRadius: '8px', padding: '14px 16px', marginBottom: '16px' }}>
          <p style={{ color: '#3d6e13', fontSize: '0.9rem', marginBottom: '8px' }}>
            Logged in as <strong>{user.email}</strong> ({user.role})
          </p>
          <button
            onClick={logout}
            style={{ background: 'none', border: '1px solid #3d6e13', borderRadius: '4px', color: '#3d6e13', padding: '4px 12px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Log out
          </button>
        </div>
      )}
      <a href="/" style={{ color: '#3d6e13', fontWeight: 600 }}>← Back to home</a>
    </div>
  )
}

// ── AppRoutes ─────────────────────────────────────────────────
// Separated from App so it can use useAuth() —
// hooks only work inside the Provider tree.
function AppRoutes() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public routes — anyone can access */}
          <Route path="/" element={<SchedulePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />

          <Route
            path="/activities/new"
            element={
              <ProtectedRoute requiredRoles={MANAGER_ROLES}>
                <ActivityFormPage />
              </ProtectedRoute>
            }
          />

          <Route path="/activities/:id" element={<ActivityDetailPage />} />

          <Route
            path="/activities/:id/edit"
            element={
              <ProtectedRoute requiredRoles={EDITOR_ROLES}>
                <ActivityFormPage />
              </ProtectedRoute>
            }
          />

          {/* Protected route — must be logged in (any role) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Placeholder title="Profile" />
              </ProtectedRoute>
            }
          />

          {/* Catch-all: any unknown URL renders the 404 page.
              Previously this silently Navigate'd to "/" which masked
              broken internal links and confused users who pasted a bad URL.
              See: pages/NotFoundPage.jsx. */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  )
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      {/* AuthProvider must be the outermost wrapper
          so every component in the tree can call useAuth().

          ToastProvider lives inside AuthProvider so that the
          toast-triggering code we'll add next (e.g. "session
          expired") can read auth state. Order is intentional. */}
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}