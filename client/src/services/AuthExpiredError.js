// Thrown by service functions when a protected API call returns 401.
// Pages catch this and call useAuthExpiredHandler() to clear the
// session and redirect to /login.
//
// Why a typed class instead of just checking response.status in pages:
//   - Lets services own the "did the token get rejected?" check
//     in one place instead of every page repeating `if (res.status === 401)`
//   - `catch (err) { if (err instanceof AuthExpiredError) ... }` is
//     cleaner than parsing error.message strings
//   - Future-proof: if we ever need to attach extra info (the URL that
//     failed, retry hints, etc.) it's a real object we can extend

export class AuthExpiredError extends Error {
  constructor(message = 'Session expired') {
    super(message)
    this.name = 'AuthExpiredError'
    // Setting .name explicitly so error.name === 'AuthExpiredError'
    // in DevTools — otherwise it would just say 'Error' which makes
    // them harder to spot during debugging.
  }
}