// Single source of truth for the backend base URL.
//
// Why this file exists:
//   In dev, vite.config.js proxies '/api/*' to http://localhost:3001
//   so relative URLs like fetch('/api/activities') just work.
//   In production (Vercel) there is NO proxy — the frontend and
//   backend are on different origins, so we must prefix every
//   request with the deployed backend URL.
//
// Usage:
//   import { API_BASE_URL } from '../services/apiConfig.js'
//   fetch(`${API_BASE_URL}/api/activities`)
//
// How VITE_API_URL is set:
//   - Local dev:   leave it unset → falls back to '' → vite proxy handles it
//   - Production:  set VITE_API_URL in Vercel project settings to the
//                  deployed backend origin, e.g. https://hkif-api.onrender.com
//                  (NO trailing slash, NO '/api' suffix)
//
// Note: Vite inlines env vars at BUILD time, not runtime.
// If you change VITE_API_URL on Vercel you must redeploy.
// ─────────────────────────────────────────────────────────────

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''
// '' (empty string) keeps relative paths working in dev, which means
// the vite proxy in vite.config.js still kicks in and forwards to localhost:3001.