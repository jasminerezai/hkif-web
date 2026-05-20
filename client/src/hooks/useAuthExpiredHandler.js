// Centralised "your session just expired mid-use" handler.
//
// Combines three things every protected page would otherwise do
// inline whenever an API call comes back 401:
//   1. logout()                  — clear AuthContext + localStorage
//   2. showToast(..., 'error')   — tell the user what happened
//   3. navigate('/login', ...)   — bounce them out, preserve the URL
//                                  so LoginPage can return them after.
//
// USAGE:
//   const handleAuthExpired = useAuthExpiredHandler()
//   ...
//   if (res.status === 401) {
//     handleAuthExpired()
//     return
//   }
//
// or when catching an AuthExpiredError thrown by a service:
//   try { await fetchFavorites(token) }
//   catch (err) {
//     if (err instanceof AuthExpiredError) handleAuthExpired()
//     else                                 showToast(...)
//   }
//
// NOTE: this is the *mid-session* expiry path. Page-load token
// rehydration is handled separately inside AuthContext (silent —
// no toast, no redirect, just clears localStorage).

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export function useAuthExpiredHandler() {
  const { logout }    = useAuth()
  const { showToast } = useToast()
  const navigate      = useNavigate()

  // useCallback with no React Router location in the deps keeps the
  // returned function identity stable across renders. Important
  // because pages will sometimes put it in useEffect dep arrays.
  //
  // We read window.location.pathname at call time (rather than
  // capturing a useLocation() value) for the same reason — matches
  // the existing pattern in ActivityFormPage.jsx.
  return useCallback(() => {
    logout()

    showToast(
      'Your session has expired. Please log in again.',
      'error',
    )

    navigate('/login', {
      replace: true,
      // replace: true so the broken-session URL isn't left in
      // history. Otherwise hitting "back" after re-login would
      // send the user to a page that just kicked them out.
      state: { from: { pathname: window.location.pathname } },
      // LoginPage reads location.state.from.pathname to send the
      // user back to where they were after they re-authenticate.
    })
  }, [logout, showToast, navigate])
}