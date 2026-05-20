import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge, { STATUS_VARIANT } from '../components/ui/Badge.jsx'

export default function ActivityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await fetch(`/api/activities/${id}`)
        if (!res.ok) {
          throw new Error('Failed to fetch activity')
        }
        const json = await res.json()
        if (json.status === 'success' && json.data) {
          setActivity(json.data)
        } else {
          setError('Activity not found')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadActivity()
  }, [id])

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-12) var(--space-6)', maxWidth: '800px', margin: '0 auto' }}>
        <p>Loading activity details...</p>
      </div>
    )
  }

  if (error || !activity) {
    return (
      <div style={{ padding: 'var(--space-12) var(--space-6)', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>
          Error
        </h1>
        <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-6)' }}>
          {error || 'Activity not found'}
        </p>
        <Link to="/activities" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          ← Back to Activities
        </Link>
      </div>
    )
  }

  const isCancelled = activity.defaultStatus === 'CANCELLED'
  const canEdit = ['BOARD_MEMBER', 'ADMIN'].includes(user?.role)

  return (
    <div className="page-wrapper" style={{ background: 'var(--color-surface)', minHeight: 'calc(100vh - var(--nav-height))' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Navigation & Actions Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <Link to="/activities" style={{ color: 'var(--color-primary-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            ← Back to Activities
          </Link>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/activities/${activity.id}/edit`)}
            >
              Edit Activity
            </Button>
          )}
        </div>

        {/* Cancelled Banner */}
        {isCancelled && (
          <div style={{
            background: 'var(--color-danger-light)',
            borderLeft: '6px solid var(--color-danger)',
            color: 'var(--color-danger)',
            padding: 'var(--space-4) var(--space-6)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            fontWeight: 700,
            fontSize: 'var(--text-base)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <span style={{ fontSize: 'var(--text-xl)' }}>⚠️</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700 }}>This activity has been cancelled.</p>
              <p style={{ margin: '2px 0 0', fontWeight: 400, fontSize: 'var(--text-sm)', opacity: 0.9 }}>
                No active schedules or future sessions will run until the activity is reactivated.
              </p>
            </div>
          </div>
        )}

        {/* Main Details Card */}
        <Card padding="lg" shadow="md">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: 0
              }}>
                {activity.name}
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                Activity Details
              </p>
            </div>
            
            {/* Status Badge */}
            <Badge variant={STATUS_VARIANT[activity.defaultStatus]}>
              {activity.defaultStatus}
            </Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
            
            {/* Location */}
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
              <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '2px' }}>
                Location
              </p>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)' }}>
                📍 {activity.location}
              </p>
            </div>

            {/* Capacity */}
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
              <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '2px' }}>
                Capacity Limits
              </p>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)' }}>
                👥 {activity.maxCapacity ? `${activity.maxCapacity} people max` : 'Unlimited capacity'}
              </p>
            </div>

            {/* Description */}
            {activity.description && (
              <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
                <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '2px' }}>
                  Description
                </p>
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text)', lineHeight: 1.6 }}>
                  {activity.description}
                </p>
              </div>
            )}

            {/* Notes */}
            {activity.notes && (
              <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
                <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '2px' }}>
                  Important Notes
                </p>
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text)', fontStyle: 'italic' }}>
                  📝 {activity.notes}
                </p>
              </div>
            )}

            {/* Time Slots */}
            {activity.timeSlots?.length > 0 && (
              <div>
                <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
                  Weekly Time Slots
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {activity.timeSlots.map(slot => (
                    <div
                      key={slot.id}
                      style={{
                        background: 'var(--color-surface)',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{slot.weekday}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(slot.startTime).toISOString().slice(11, 16)} - {new Date(slot.endTime).toISOString().slice(11, 16)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </Card>
      </div>
    </div>
  )
}
