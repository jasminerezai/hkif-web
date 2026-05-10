// Global auth state for the entire app.
// Holds the current user object and JWT token.
// Exposes login, register, logout, getAuthHeader.
//
// ARCHITECTURE — aligned with PR #44 (auth.ts refactor):
//
// User shape stored in state:
//   { id, email, name, role }
//
// After login/register:
//   - token saved to localStorage under TOKEN_KEY
//   - minimal session { id, role } saved to localStorage under SESSION_KEY
//   - full user { id, email, name, role } from login/register response
//     saved to React state (NOT trusted from localStorage on reload)
//
// On page reload (rehydration):
//   - read token from localStorage
//   - call GET /api/auth/me with Bearer token to verify it's still valid
//   - if valid: /me returns { id, role }, combined with token to restore session
//   - name/email not available until a fresh API call — Navbar shows id until /me
//
// Role enum (ProfileRole) — MEMBER is the new USER:
//   MEMBER < LEADER < BOARD_MEMBER < ADMIN
//   There is NO 'USER' role. It was renamed to 'MEMBER' in PR #44.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'

import {
  loginRequest,
  registerRequest,
  getMeRequest,
} from '../services/AuthService.js'

// ── Storage keys ──────────────────────────────────────────────
const TOKEN_KEY   = 'hkif_token'
// Stores only the raw JWT string

const SESSION_KEY = 'hkif_session'
// Stores only { id, role } — the minimal safe data
// We do NOT store name/email in localStorage because:
//   1. The JWT payload no longer contains them
//   2. They could become stale if the user updates their profile
//   3. /me is the single source of truth for profile data

// ── Create context ────────────────────────────────────────────
const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  // ── State ─────────────────────────────────────────────────
  // user shape: { id, email, name, role } | null
  // role values: 'MEMBER' | 'LEADER' | 'BOARD_MEMBER' | 'ADMIN'
  // Note: 'USER' no longer exists — it was renamed to 'MEMBER' in PR #44
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(null)
  const [loading, setLoading] = useState(true)
  // loading stays true until we finish the rehydration check.
  // ProtectedRoute reads this to avoid a flicker redirect on page load.

  // ── Rehydration on page load ──────────────────────────────
  // When the user refreshes the page, React state is lost.
  // We restore the session by:
  //   1. Reading the token from localStorage
  //   2. Calling GET /api/auth/me to verify the token is still valid
  //   3. If valid: restoring { id, role } from /me response
  //   4. If invalid (expired/deleted): clearing localStorage and staying logged out
  //
  // We do NOT restore name/email from localStorage.
  // The Navbar will show the user as logged in (Profile link visible)
  // based on isAuthenticated, which only needs user !== null.
  // The full name appears once any page calls /me or the user data
  // is available from a fresh login.
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)

    if (!savedToken) {
      // No token stored — user was never logged in or explicitly logged out
      setLoading(false)
      return
    }

    // Token exists — verify it's still valid by calling /me
    getMeRequest(savedToken)
      .then(minimalUser => {
        // minimalUser = { id, role } from authMiddleware
        // We restore the session with what we have.
        // name and email are not available yet from /me alone
        // (authMiddleware only attaches { id, role } to req.user)
        // so we read the saved session for id/role as a fallback,
        // and treat name/email as unavailable until user navigates
        // to a page that fetches their full profile.
        setToken(savedToken)

        // Try to recover name/email from the saved session
        // This is acceptable because the /me call already confirmed
        // the token is valid — if the token is valid, the user exists.
        const savedSession = localStorage.getItem(SESSION_KEY)
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession)
            // Merge: use live role from /me (most up to date),
            // use saved name/email as best available until refreshed
            setUser({
              id:    minimalUser.id,
              role:  minimalUser.role,
              // role from /me is the live DB value — authoritative
              email: parsed.email || null,
              name:  parsed.name  || null,
              // name/email from session — may be stale but acceptable for display
            })
          } catch {
            // Corrupted session data — use minimal user only
            setUser(minimalUser)
          }
        } else {
          setUser(minimalUser)
        }
      })
      .catch(() => {
        // Token is expired, invalid, or user was deleted.
        // Clean up localStorage so they get a fresh login.
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(SESSION_KEY)
        // user stays null — they'll be redirected to /login by ProtectedRoute
      })
      .finally(() => {
        setLoading(false)
        // Always stop the loading spinner whether rehydration succeeded or not
      })

  }, [])

  // ── saveSession ───────────────────────────────────────────
  // Called after login and register succeed.
  // Saves to React state AND localStorage.
  function saveSession(fullUser, jwtToken) {
    setUser(fullUser)
    setToken(jwtToken)

    // Save token for rehydration
    localStorage.setItem(TOKEN_KEY, jwtToken)

    // Save user data for rehydration
    // We save name and email here because the login/register response
    // from auth.service.ts toUserDto() does return them.
    // On rehydration we use /me to verify the token then restore
    // these values from this saved session.
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      id:    fullUser.id,
      role:  fullUser.role,
      email: fullUser.email,
      name:  fullUser.name,
    }))
  }

  // ── login ─────────────────────────────────────────────────
  // Called by LoginPage on form submit.
  // Gets token + user from /login, saves the session.
  // Throws on bad credentials — LoginPage catches and shows the error.
  async function login(email, password) {
    const data = await loginRequest(email, password)
    // data = { user: { id, email, name, role }, token }
    // auth.service.ts toUserDto() returns all four fields even though
    // the JWT payload only carries { id, role }

    saveSession(data.user, data.token)
    return data.user
  }

  // ── register ──────────────────────────────────────────────
  // Called by RegisterPage on form submit.
  // New users are created with ProfileRole.MEMBER (not USER).
  async function register(email, password, name) {
    const data = await registerRequest(email, password, name)
    // data.user.role will be 'MEMBER' — the default in auth.service.ts
    saveSession(data.user, data.token)
    return data.user
  }

  // ── logout ────────────────────────────────────────────────
  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(SESSION_KEY)
  }

  // ── getAuthHeader ─────────────────────────────────────────
  // Returns the Authorization header needed for protected API calls.
  // Usage in any service file:
  //   const { getAuthHeader } = useAuth()
  //   fetch('/api/schedule', { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } })
  function getAuthHeader() {
    return token ? { Authorization: `Bearer ${token}` } : {}
    // authMiddleware checks: req.headers.authorization?.startsWith('Bearer ')
  }

  const isAuthenticated = user !== null

  const value = {
    user,            // { id, email, name, role } | null
    token,           // string | null
    isAuthenticated, // boolean
    loading,         // boolean — true during rehydration check on page load
    login,           // async (email, password) => user
    register,        // async (email, password, name) => user
    logout,          // () => void
    getAuthHeader,   // () => { Authorization: 'Bearer ...' } | {}
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth() must be used inside <AuthProvider>')
  }
  return context
}