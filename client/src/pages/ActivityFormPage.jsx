import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Button, Input, Card } from '../components/ui'

const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const STATUSES = ['ACTIVE', 'INACTIVE', 'CANCELLED', 'DELAYED']

export default function ActivityFormPage() {
  const { user, getAuthHeader } = useAuth()
  const navigate = useNavigate()
  const { id: activityId } = useParams()
  const isEditMode = Boolean(activityId)

  // Role check
  const canManageActivities = ['LEADER', 'BOARD_MEMBER', 'ADMIN'].includes(user?.role)
  if (!canManageActivities) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-danger)' }}>
          You don't have permission to access this page.
        </p>
      </div>
    )
  }

  // Form state
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [maxCapacity, setMaxCapacity] = useState('')
  const [defaultStatus, setDefaultStatus] = useState('ACTIVE')
  const [timeSlots, setTimeSlots] = useState([
    { weekday: 'MONDAY', startAt: '18:00:00', endAt: '19:30:00' }
  ])

  // UI state
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  // Load existing activity in edit mode
  useEffect(() => {
    if (!isEditMode) return
    fetch(`/api/activities/${activityId}`)
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success') {
          const a = json.data
          setName(a.name || '')
          setLocation(a.location || '')
          setDescription(a.description || '')
          setNotes(a.notes || '')
          setMaxCapacity(a.maxCapacity ?? '')
          setDefaultStatus(a.defaultStatus || 'ACTIVE')
          if (a.timeSlots?.length > 0) {
            setTimeSlots(a.timeSlots.map(slot => ({
              weekday: slot.weekday,
              startAt: new Date(slot.startTime).toISOString().slice(11, 19),
              endAt:   new Date(slot.endTime).toISOString().slice(11, 19),
            })))
          }
        }
      })
      .catch(() => setServerError('Failed to load activity.'))
  }, [activityId, isEditMode])

  // TimeSlot helpers
  function addTimeSlot() {
    setTimeSlots([...timeSlots, { weekday: 'MONDAY', startAt: '18:00:00', endAt: '19:30:00' }])
  }

  function removeTimeSlot(index) {
    setTimeSlots(timeSlots.filter((_, i) => i !== index))
  }

  function updateTimeSlot(index, field, value) {
    setTimeSlots(timeSlots.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    ))
  }

  // Validation
  function validate() {
    const errs = {}
    if (!name.trim()) errs.name = 'Name is required.'
    if (!location.trim()) errs.location = 'Location is required.'
    if (maxCapacity && isNaN(Number(maxCapacity))) errs.maxCapacity = 'Must be a number.'
    if (timeSlots.length === 0) errs.timeSlots = 'At least one time slot is required.'
    return errs
  }

  // Submit
  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setServerError('')

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)

    const body = {
      name: name.trim(),
      location: location.trim(),
      description: description.trim() || null,
      notes: notes.trim() || null,
      maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
      defaultStatus,
      leaders: [],
      timeSlots,
    }

    try {
      const url = isEditMode
        ? `/api/activities/${activityId}`
        : '/api/activities'

      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(body),
      })

      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error || 'Something went wrong.')
        return
      }

      // Redirect to activity detail page on success
      navigate(`/activities/${json.data.id}`)

    } catch {
      setServerError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Render
  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '600px' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'var(--text-3xl)',
          marginBottom: 'var(--space-8)',
          color: 'var(--color-text)',
        }}>
          {isEditMode ? 'Edit Activity' : 'Create Activity'}
        </h1>

        {serverError && (
          <div style={{
            background: 'var(--color-danger-light)',
            borderLeft: '4px solid var(--color-danger)',
            color: 'var(--color-danger)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-6)',
            fontSize: 'var(--text-sm)',
          }}>
            {serverError}
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

            <Input
              label="Activity name"
              placeholder="e.g. Volleyball"
              value={name}
              onChange={e => setName(e.target.value)}
              error={errors.name}
              disabled={loading}
            />

            <Input
              label="Location"
              placeholder="e.g. Sportshall"
              value={location}
              onChange={e => setLocation(e.target.value)}
              error={errors.location}
              disabled={loading}
            />

            <Input
              label="Description (optional)"
              placeholder="Short description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={loading}
            />

            <Input
              label="Notes (optional)"
              placeholder="Any extra info"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={loading}
            />

            <Input
              label="Max capacity (optional)"
              type="number"
              placeholder="e.g. 20"
              value={maxCapacity}
              onChange={e => setMaxCapacity(e.target.value)}
              error={errors.maxCapacity}
              disabled={loading}
            />

            {/* Default status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                Default status
              </label>
              <select
                value={defaultStatus}
                onChange={e => setDefaultStatus(e.target.value)}
                disabled={loading}
                style={{
                  padding: '9px 13px',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-body)',
                  background: '#ffffff',
                  color: 'var(--color-text)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Time slots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                  Time slots
                </label>
                <Button type="button" variant="outline" size="sm" onClick={addTimeSlot} disabled={loading}>
                  + Add slot
                </Button>
              </div>

              {errors.timeSlots && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)' }}>{errors.timeSlots}</p>
              )}

              {timeSlots.map((slot, index) => (
                <Card key={index} border="accent" padding="sm">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Slot {index + 1}</span>
                      {timeSlots.length > 1 && (
                        <Button type="button" variant="danger" size="sm" onClick={() => removeTimeSlot(index)} disabled={loading}>
                          Remove
                        </Button>
                      )}
                    </div>

                    {/* Weekday */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>Weekday</label>
                      <select
                        value={slot.weekday}
                        onChange={e => updateTimeSlot(index, 'weekday', e.target.value)}
                        disabled={loading}
                        style={{
                          padding: '9px 13px',
                          border: '1.5px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--text-base)',
                          fontFamily: 'var(--font-body)',
                          background: '#ffffff',
                          color: 'var(--color-text)',
                        }}
                      >
                        {WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                      <Input
                        label="Start time"
                        placeholder="18:00:00"
                        value={slot.startAt}
                        onChange={e => updateTimeSlot(index, 'startAt', e.target.value)}
                        disabled={loading}
                      />
                      <Input
                        label="End time"
                        placeholder="19:30:00"
                        value={slot.endAt}
                        onChange={e => updateTimeSlot(index, 'endAt', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button type="submit" fullWidth loading={loading}>
              {loading
                ? isEditMode ? 'Saving...' : 'Creating...'
                : isEditMode ? 'Save changes' : 'Create activity'
              }
            </Button>

          </form>
        </Card>
      </div>
    </div>
  )
}