export async function fetchFavorites(token) {

  const response = await fetch(
    '/api/users/me/favorites',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch favorites')
  }

  return response.json()
}

export async function addFavorite(activityId, token) {

  const response = await fetch(
    `/api/users/me/favorites/${activityId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to add favorite')
  }
}

export async function removeFavorite(activityId, token) {

  const response = await fetch(
    `/api/users/me/favorites/${activityId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to remove favorite')
  }
}