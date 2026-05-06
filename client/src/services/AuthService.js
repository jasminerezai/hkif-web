// src/services/authService.js
//
// All calls to the auth API live here.
// AuthContext imports these functions — nothing else should call them directly.
//
// Backend base URL is proxied through Vite (see vite.config.js).
// So /api/auth/login → http://localhost:3001/api/auth/login in dev.
//
// Backend response shape (from auth.controller.ts):
// {
//   status: 'success',
//   data: {
//     user: { id: number, email: string, name: string, role: string },
//     token: string
//   }
// }

const BASE = '/api/auth'

// ─────────────────────────────────────────────────────────────
// loginRequest
// Calls POST /api/auth/login
// Returns { user, token } on success
// Throws an Error with the server's message on failure
// ─────────────────────────────────────────────────────────────
export async function loginRequest(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Tell the server the body is JSON, not a form
    },
    body: JSON.stringify({ email, password }),
    // JSON.stringify turns { email, password } into a string:
    // '{"email":"...","password":"..."}'
  })

  const json = await res.json()
  // Parse the response body as JSON regardless of status code
  // so we can read the error message even when res.ok is false

  if (!res.ok) {
    // res.ok is true for 2xx status codes (200, 201 etc.)
    // false for 4xx (400 bad request, 401 unauthorised) and 5xx
    throw new Error(json.message || 'Login failed. Please try again.')
  }

  // json.data matches what auth.service.ts returns:
  // { user: { id, email, name, role }, token }
  return json.data
}

// ─────────────────────────────────────────────────────────────
// registerRequest
// Calls POST /api/auth/register
// Backend expects: { email, password, name }
// Returns { user, token } on success
// ─────────────────────────────────────────────────────────────
export async function registerRequest(email, password, name) {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
    // 'name' maps to 'profile_name' in the backend — the controller
    // reads req.body.name and passes it to the service as profile_name
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.message || 'Registration failed. Please try again.')
  }

  return json.data
  // Returns { user: { id, email, name, role }, token }
}

// ─────────────────────────────────────────────────────────────
// getMeRequest TODO
// Calls GET /api/users/me (not built yet on backend)
