import { API_BASE_URL } from './apiConfig.js'

export async function updateScheduleStatus(
  activityId,
  scheduleId,
  status,
  token
) {
  const res = await fetch(
    `${API_BASE_URL}/api/activities/${activityId}/schedules/${scheduleId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  )

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error || 'Failed to update status')
  }

  return json.data
}