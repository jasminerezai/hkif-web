import { API_BASE_URL } from './apiConfig.js'

export async function fetchLeaderActivities(
  getAuthHeader,
  userId,
  handleAuthExpired
) {
  const res = await fetch(
    `${API_BASE_URL}/api/activities?leaderId=${userId}`,
    {
      headers: {
        ...getAuthHeader(),
      },
    }
  )

  if (res.status === 401) {
    handleAuthExpired()
    return []
  }

  const json = await res.json()

  if (!res.ok) {
    throw new Error(
      json.error || 'Failed to load leader activities'
    )
  }

  return json.data
}