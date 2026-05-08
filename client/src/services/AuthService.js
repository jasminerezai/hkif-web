// All API calls for authentication live here.
// AuthContext imports these — nothing else should call them directly.
//
// IMPORTANT — new architecture after PR #44 (auth.ts refactor):
//
// The JWT payload and req.user now only carry { id, role }.
// Name and email are NOT in the token anymore.
//
// Flow:
//   1. POST /api/auth/login or /register → returns { user: {id,role}, token }
//   2. Immediately call GET /api/auth/me with the token → returns full user
//   3. Only the /me response is the source of truth for name and email
//
// Never rely on the login/register response for name or email.
// Never rely on localStorage for anything beyond token and {id, role}.

const BASE = '/api/auth'

// ── loginRequest ──────────────────────────────────────────────
// POST /api/auth/login
// Returns { token, minimalUser: { id, role } }
// Throws on bad credentials or network error
export async function loginRequest(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  })

  const json = await res.json()

  if (!res.ok) {
    // Backend errorHandler returns { error: message, statusCode: N }
    throw new Error(json.error || 'Login failed. Please try again.')
    // Note: field is 'error' not 'message' — matches errorHandler.ts
  }

  // json.data = { user: { id, email, name, role }, token }
  // We return all of it but AuthContext will only trust id, role, token
  // and then call getMeRequest for the full fresh user from the DB.
  return json.data
}

// ── registerRequest ───────────────────────────────────────────
// POST /api/auth/register
// Backend expects: { email, password, name }
// Returns { token, user: { id, role } }
// Throws if email already exists or validation fails
export async function registerRequest(email, password, name) {
  const res = await fetch(`${BASE}/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password, name }),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error || 'Registration failed. Please try again.')
  }

  return json.data
  // Returns { user: { id, email, name, role }, token }
  // Same as login — AuthContext will call /me for the fresh full user
}

// ── getMeRequest ──────────────────────────────────────────────
// GET /api/auth/me
// Protected by authMiddleware — MUST send Bearer token.
//
// This is now the ONLY source of truth for the user's name and email.
// The JWT payload only carries { id, role } so we cannot get
// name/email from the token or from the login response directly.
//
// Called:
//   1. After login/register — to get the full user object
//   2. On page load — to rehydrate the session from a stored token
//
// Returns the full user object: { id, email, name, role }
// Throws if the token is missing, expired, or the user no longer exists
export async function getMeRequest(token) {
  const res = await fetch(`${BASE}/me`, {
    method:  'GET',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
      // authMiddleware checks req.headers.authorization.startsWith('Bearer ')
      // then verifyToken(token) — throws if expired or invalid
    },
  })

  const json = await res.json()

  if (!res.ok) {
    // 401 = token expired or user deleted
    // We throw so AuthContext can clean up localStorage
    throw new Error(json.error || 'Session expired. Please log in again.')
  }

  // json.data = { user: { id, email, name, role } }
  // getMeHandler in auth.controller.ts does:
  //   res.json({ status: 'success', data: { user: req.user } })
  // But req.user from authMiddleware is only { id, role } —
  // the DB lookup in authMiddleware uses select: { id: true, role: true }
  //
  // WAIT: re-reading auth.controller.ts getMeHandler:
  //   res.json({ status: 'success', data: { user: req.user } })
  // and auth.middleware attaches: req.user = { id, role }
  //
  // So /me actually returns { id, role } not the full profile.
  // The full profile (with name/email) comes from the login response.
  // We use /me only for rehydration to verify the token is still valid
  // and to get the current role (in case it changed since last login).
  return json.data.user
  // Returns { id, role } — the live DB values after middleware lookup
}