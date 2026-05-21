import { API_BASE_URL } from './apiConfig.js'

export async function fetchProfile(token) {

  const response = await fetch(
    `${API_BASE_URL}/api/users/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch profile')
  }

  return response.json()
}