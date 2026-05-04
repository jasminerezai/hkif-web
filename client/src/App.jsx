// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'

// ── ProtectedRoute ────────────────────────────────────────────
// Wraps any route that requires login.
// If not authenticated → redirect to /login
// Passes the blocked URL in location.state so LoginPage can
// redirect back after a successful login.
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
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
    return (
      <Navigate
        to="/login"
        replace
        // replace: don't push /profile onto history —
        // back button won't loop them back to the blocked page
        state={{ from: location }}
        // location.pathname passed here so LoginPage can redirect
        // the user back after they log in
      />
    )
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
    <Routes>
      {/* Public routes — anyone can access */}
      <Route path="/"               element={<Placeholder title="Schedule" />} />
      <Route path="/login"          element={<Placeholder title="Login" />} />
      <Route path="/register"       element={<Placeholder title="Register" />} />
      <Route path="/activities"     element={<Placeholder title="Activities" />} />
      <Route path="/activities/:id" element={<Placeholder title="Activity Detail" />} />

      {/* Protected route — must be logged in */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Placeholder title="Profile" />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: any unknown URL redirects to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      {/* AuthProvider must be the outermost wrapper
          so every component in the tree can call useAuth() */}
      <AppRoutes />
    </AuthProvider>
  )
}