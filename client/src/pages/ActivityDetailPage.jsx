import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'

export default function ActivityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user, token } = useAuth()
  const [activity, setActivity] = useState(null)
  const [participantData, setParticipantData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Fetch Activity Details ───────────────────────────────────
  useEffect(() => {
    async function loadActivity() {
      try {
        const headers = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        const response = await fetch(`/api/activities/${id}`, { headers })
        if (!response.ok) {
          throw new Error('Failed to fetch activity details')
        }
        const result = await response.json()
        setActivity(result.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadActivity()
  }, [id, token])

  // ── Determine if user is a leader/admin for this activity ────
  const isLeader = useMemo(() => {
    if (!isAuthenticated || !activity) return false
    return (
      user.role === 'ADMIN' ||
      user.role === 'BOARD_MEMBER' ||
      (user.role === 'LEADER' && activity.leaders?.some(l => l.profileId === user.id))
    )
  }, [isAuthenticated, user, activity])

  // ── Fetch Attendee List (Leaders/Admins only) ────────────────
  useEffect(() => {
    if (!isLeader) return

    async function loadParticipants() {
      try {
        const response = await fetch(`/api/activities/${id}/participants`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const result = await response.json()
          setParticipantData(result.data)
        } else {
          console.error('Failed to load participants', response.statusText)
        }
      } catch (err) {
        console.error('Error fetching participants:', err)
      }
    }
    loadParticipants()
  }, [id, isLeader, token])

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Loading activity...</p>
      </div>
    )
  }

  if (error || !activity) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: '900px', margin: '0 auto' }}>
        <Card padding="md" border="accent" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-danger)', marginBottom: '12px' }}>Error</h2>
          <p style={{ marginBottom: '24px' }}>{error || 'Activity not found.'}</p>
          <Button onClick={() => navigate('/activities')}>Back to Activities</Button>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '900px', margin: '0 auto' }}>
      {/* Back button */}
      <Link to="/activities" style={{ color: 'var(--color-primary-dark)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        ← Back to Activities
      </Link>

      <Card padding="md" shadow="md" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', marginBottom: '8px', color: 'var(--color-text)' }}>
              {activity.name}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '16px', fontStyle: 'italic' }}>
              {activity.description || 'No description provided.'}
            </p>
          </div>
          {/* Action buttons if logged in */}
          {isAuthenticated && (user.role === 'ADMIN' || user.role === 'BOARD_MEMBER') && (
            <Button as={Link} to={`/activities/${activity.id}/edit`} variant="outline" size="sm">
              Edit Activity
            </Button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <div>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Location</span>
            <p style={{ fontSize: '1.1rem', marginTop: '4px', fontWeight: 500 }}>{activity.location}</p>
          </div>
          <div>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Max Capacity</span>
            <p style={{ fontSize: '1.1rem', marginTop: '4px', fontWeight: 500 }}>{activity.maxCapacity ?? 'Unlimited'}</p>
          </div>
        </div>

        {/* Time slots */}
        {activity.timeSlots?.length > 0 && (
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Scheduled Time Slots</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {activity.timeSlots.map(slot => (
                <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface)', padding: '8px 12px', borderRadius: '4px', width: 'fit-content' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{slot.weekday}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                  <span>
                    {new Date(slot.startTime).toISOString().slice(11, 16)} - {new Date(slot.endTime).toISOString().slice(11, 16)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Leader attendee list view */}
      {isLeader && (
        <Card padding="md" shadow="md" border="accent" style={{ background: '#fcfdfa' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', marginBottom: '6px', color: 'var(--color-primary-dark)' }}>
            Attendee List
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Registered participants for all schedules of this activity. Only visible to leaders.
          </p>

          {!participantData || participantData.schedules?.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>No schedules found for this activity.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {participantData.schedules.map(schedule => {
                const dateObj = new Date(schedule.startAt)
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
                const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                return (
                  <div key={schedule.scheduleId} style={{ border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden', background: '#ffffff' }}>
                    {/* Schedule Header */}
                    <div style={{ background: 'var(--color-primary-light)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--color-primary-dark)' }}>
                          {formattedDate} at {formattedTime}
                        </h3>
                        {schedule.status !== 'ACTIVE' && (
                          <span style={{
                            display: 'inline-block',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: schedule.status === 'CANCELLED' ? 'var(--color-danger)' : '#d4ac0d',
                            marginTop: '4px',
                            textTransform: 'uppercase'
                          }}>
                            {schedule.status}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, background: '#ffffff', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        {schedule.participants.length} Registered
                      </span>
                    </div>

                    {/* Participant List */}
                    <div style={{ padding: '12px 16px' }}>
                      {schedule.participants.length === 0 ? (
                        <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '4px 0' }}>No registered participants yet.</p>
                      ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {schedule.participants.map((participant, pIndex) => (
                            <li key={participant.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: pIndex < schedule.participants.length - 1 ? '8px' : '0', borderBottom: pIndex < schedule.participants.length - 1 ? '1px solid var(--color-surface)' : 'none' }}>
                              <div>
                                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{participant.profileName}</span>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginLeft: '8px' }}>({participant.email})</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
