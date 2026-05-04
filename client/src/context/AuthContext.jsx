// Global auth state for the entire app.
// Holds the current user object and JWT token.
// Exposes login, register, logout functions.
//
// HOW IT WORKS:
// 1. On first load: check localStorage for a saved token + user.
//    If found, restore them so the user stays logged in after refresh.
// 2. login() / register(): call the API, save results to state + localStorage.
// 3. logout(): clear state + localStorage.
// 4. Any component calls useAuth() to read state or call functions.

import React, {
  createContext,  // creates the context object
  useContext,     // reads a context value inside a component
  useState,       // local state inside the Provider component
  useEffect,      // runs side effects (e.g. reading localStorage on mount)
} from 'react'

import { loginRequest, registerRequest } from '../services/authService.js'

// ── TOKEN KEY ─────────────────────────────────────────────────
// Single constant for the localStorage key name.
const TOKEN_KEY = 'hkif_token'
const USER_KEY  = 'hkif_user'

// ── CREATE CONTEXT ────────────────────────────────────────────
// createContext(null) creates a context with null as default.
// The null default only applies if a component calls useAuth()
// outside of an <AuthProvider> — our useAuth() hook catches this.
const AuthContext = createContext(null)

// ─────────────────────────────────────────────────────────────
// AuthProvider
//
// Wrap your entire app with this component in App.jsx.
// Everything inside it can call useAuth().
//
// <AuthProvider>
//   <Navbar />       ← can call useAuth()
//   <Routes>...</Routes>  ← pages can call useAuth()
// </AuthProvider>
// ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {

  // ── State ──────────────────────────────────────────────────
  //
  // user: the logged-in user object or null
  // Shape (matches what the backend returns from auth.service.ts):
  // {
  //   id:    number   — profile_id in the DB
  //   email: string
  //   name:  string   — profile_name in the DB
  //   role:  string   — 'USER' | 'LEADER' | 'BOARD_MEMBER' | 'ADMIN'
  // }
  const [user, setUser] = useState(null)

  // token: the raw JWT string or null
  const [token, setToken] = useState(null)

  // loading: true while we're checking localStorage on first load.
  // Prevents a flicker where the app briefly shows "not logged in"
  // before it finishes reading the stored session.
  const [loading, setLoading] = useState(true)

  // ── Rehydrate session on page load ─────────────────────────
  //
  // useEffect with [] runs once — immediately after the first render.
  // We check localStorage for a saved token + user.
  // If found, restore them so the user doesn't have to log in again
  // every time they refresh the page.
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser  = localStorage.getItem(USER_KEY)

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        // JSON.parse converts the stored string back to an object.
        // We wrap in try/catch in case the stored value is corrupted.
      } catch {
        // If parsing fails, clear the bad data and start fresh.
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    }

    setLoading(false)
    // Always set loading to false when done — whether we found
    // a session or not.

    // TODO: When GET /api/users/me exists on the backend,
    // replace the localStorage read above with an API call:
    //
    // import { getMeRequest } from '../services/authService.js'
    //
    // if (savedToken) {
    //   getMeRequest(savedToken)
    //     .then(freshUser => {
    //       setUser(freshUser)
    //       setToken(savedToken)
    //     })
    //     .catch(() => {
    //       // Token expired or invalid — clean up
    //       localStorage.removeItem(TOKEN_KEY)
    //       localStorage.removeItem(USER_KEY)
    //     })
    //     .finally(() => setLoading(false))
    // } else {
    //   setLoading(false)
    // }

  }, [])
  // The empty [] means "run this effect only once, on mount".
  // If we put [token] here, it would re-run every time the token changes.

  // ── saveSession helper ─────────────────────────────────────
  // Called after both login and register succeed.
  // Saves the user + token to React state AND localStorage.
  function saveSession(userData, jwtToken) {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem(TOKEN_KEY, jwtToken)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    // JSON.stringify converts the user object to a string for storage.
    // localStorage can only store strings, not objects.
  }

  // ── login ──────────────────────────────────────────────────
  // Called by LoginPage after the user submits the form.
  // Calls the API, saves the session, and returns the user.
  // Throws if the API call fails — the page catches the error
  // and displays it to the user.
  async function login(email, password) {
    const data = await loginRequest(email, password)
    // data = { user: { id, email, name, role }, token }
    // If loginRequest throws, this function throws too —
    // the error propagates up to whoever called login()

    saveSession(data.user, data.token)
    return data.user
    // Return user so the calling page can navigate or show a message
  }

  // ── register ───────────────────────────────────────────────
  // Called by RegisterPage.
  async function register(email, password, name) {
    const data = await registerRequest(email, password, name)
    saveSession(data.user, data.token)
    return data.user
  }

  // ── logout ─────────────────────────────────────────────────
  // Clears everything. The user is returned to a logged-out state.
  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  // ── getAuthHeader ──────────────────────────────────────────
  // Returns the Authorization header object that any fetch() call
  // needs when talking to a protected backend endpoint.
  //
  // Usage in a service file:
  //   const { getAuthHeader } = useAuth()
  //   fetch('/api/schedule', { headers: getAuthHeader() })
  function getAuthHeader() {
    // The backend's protect middleware reads:
    // req.headers.authorization.startsWith('Bearer')
    // then splits on ' ' to get the token.
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // ── isAuthenticated ────────────────────────────────────────
  // Simple boolean derived from user state.
  // Cleaner to use than checking `user !== null` everywhere.
  const isAuthenticated = user !== null

  // ── Context value ──────────────────────────────────────────
  // Everything exposed to the rest of the app via useAuth().
  const value = {
    user,            // object | null — the logged-in user
    token,           // string | null — the raw JWT
    isAuthenticated, // boolean
    loading,         // boolean — true during initial session restore
    login,           // async (email, password) => user
    register,        // async (email, password, name) => user
    logout,          // () => void
    getAuthHeader,   // () => { Authorization: 'Bearer ...' } | {}
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* children = everything wrapped inside <AuthProvider> in App.jsx */}
    </AuthContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────
// useAuth — the custom hook every component uses
//
// Usage:
//   import { useAuth } from '../context/AuthContext.jsx'
//   const { user, isAuthenticated, login, logout } = useAuth()
// ─────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    // This only happens if useAuth() is called outside <AuthProvider>.
    // Gives a clear error message instead of a confusing "cannot read
    // property of null" crash.
    throw new Error('useAuth() must be used inside <AuthProvider>')
  }

  return context
}