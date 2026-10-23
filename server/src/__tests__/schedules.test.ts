import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { mockPrismaClient } from './setup.js';
import { testUUID } from './helpers.js';

// ─────────────────────────────────────────────────────────────────
// Schedules Endpoints Integration Tests (including T16 Date Range)
// ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

function createMockScheduleRecord(overrides: Partial<any> = {}) {
  const scheduleId = overrides.id ?? testUUID();
  const activityId = overrides.activityId ?? testUUID();
  const leaderId = testUUID();

  return {
    id: scheduleId,
    activityId,
    startAt: overrides.startAt ?? new Date('2026-10-15T10:00:00.000Z'),
    endAt: overrides.endAt ?? new Date('2026-10-15T11:00:00.000Z'),
    status: overrides.status ?? 'ACTIVE',
    createdAt: new Date('2026-10-01T00:00:00.000Z'),
    updatedAt: new Date('2026-10-01T00:00:00.000Z'),
    _count: {
      participations: overrides.participantCount ?? 3,
    },
    activity: {
      id: activityId,
      name: overrides.activityName ?? 'Badminton',
      location: 'Hall B',
      description: 'Weekly badminton session',
      maxCapacity: 12,
      defaultStatus: 'ACTIVE',
      notes: null,
      createdAt: new Date('2026-10-01T00:00:00.000Z'),
      updatedAt: new Date('2026-10-01T00:00:00.000Z'),
      leaders: [
        {
          profile: {
            id: leaderId,
            profileName: 'Coach Jane',
          },
        },
      ],
    },
  };
}

describe('GET /api/schedules/range (Date Range / Month Endpoint - T16)', () => {
  it('returns 200 with schedules formatted as ScheduleDto within startDate and endDate', async () => {
    const mockRecord = createMockScheduleRecord({
      startAt: new Date('2026-10-15T10:00:00.000Z'),
      activityName: 'Morning Yoga',
      participantCount: 5,
    });
    mockPrismaClient.schedule.findMany.mockResolvedValueOnce([mockRecord]);

    const res = await request(app)
      .get('/api/schedules/range')
      .query({ startDate: '2026-10-01', endDate: '2026-10-31' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);

    const item = res.body.data[0];
    expect(item.id).toBe(mockRecord.id);
    expect(item.activityId).toBe(mockRecord.activityId);
    expect(item.activity.name).toBe('Morning Yoga');
    expect(item.leaders).toEqual([{ id: expect.any(String), profileName: 'Coach Jane' }]);
    expect(item.participantCount).toBe(5);

    // Verify Prisma query boundaries
    expect(mockPrismaClient.schedule.findMany).toHaveBeenCalledTimes(1);
    const queryArgs = mockPrismaClient.schedule.findMany.mock.calls[0]![0];
    const andClauses = queryArgs.where.AND;
    expect(andClauses[0].startAt.gte.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    expect(andClauses[1].startAt.lte.toISOString()).toBe('2026-10-31T23:59:59.999Z');
  });

  it('supports alias query parameters from and to', async () => {
    const mockRecord = createMockScheduleRecord();
    mockPrismaClient.schedule.findMany.mockResolvedValueOnce([mockRecord]);

    const res = await request(app)
      .get('/api/schedules/range')
      .query({ from: '2026-10-01', to: '2026-10-31' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveLength(1);
  });

  it('supports ISO datetime strings for startDate and endDate', async () => {
    mockPrismaClient.schedule.findMany.mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/schedules/range')
      .query({
        startDate: '2026-10-01T08:00:00.000Z',
        endDate: '2026-10-31T20:00:00.000Z',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toEqual([]);

    const queryArgs = mockPrismaClient.schedule.findMany.mock.calls[0]![0];
    expect(queryArgs.where.AND[0].startAt.gte.toISOString()).toBe('2026-10-01T08:00:00.000Z');
    expect(queryArgs.where.AND[1].startAt.lte.toISOString()).toBe('2026-10-31T20:00:00.000Z');
  });

  it('supports ?month=YYYY-MM parameter covering the entire calendar month', async () => {
    const mockRecord = createMockScheduleRecord();
    mockPrismaClient.schedule.findMany.mockResolvedValueOnce([mockRecord]);

    const res = await request(app)
      .get('/api/schedules/range')
      .query({ month: '2026-10' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveLength(1);

    const queryArgs = mockPrismaClient.schedule.findMany.mock.calls[0]![0];
    expect(queryArgs.where.AND[0].startAt.gte.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    expect(queryArgs.where.AND[1].startAt.lte.toISOString()).toBe('2026-10-31T23:59:59.999Z');
  });

  it('returns 200 with empty array when no schedules are in the date range', async () => {
    mockPrismaClient.schedule.findMany.mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/schedules/range')
      .query({ startDate: '2026-10-01', endDate: '2026-10-31' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toEqual([]);
  });

  it('returns 400 Bad Request when query parameters are missing', async () => {
    const res = await request(app).get('/api/schedules/range');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Both startDate and endDate are required');
  });

  it('returns 400 Bad Request when only startDate is provided', async () => {
    const res = await request(app)
      .get('/api/schedules/range')
      .query({ startDate: '2026-10-01' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Both startDate and endDate are required');
  });

  it('returns 400 Bad Request when startDate is after endDate', async () => {
    const res = await request(app)
      .get('/api/schedules/range')
      .query({ startDate: '2026-10-31', endDate: '2026-10-01' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('startDate must be before or equal to endDate');
  });

  it('returns 400 Bad Request when date format is invalid', async () => {
    const res = await request(app)
      .get('/api/schedules/range')
      .query({ startDate: 'not-a-date', endDate: '2026-10-31' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 Bad Request when month format is invalid', async () => {
    const res = await request(app)
      .get('/api/schedules/range')
      .query({ month: '2026-13' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/schedules (Collection Endpoint with Range & Week Support)', () => {
  it('supports date range parameters on /api/schedules directly', async () => {
    const mockRecord = createMockScheduleRecord();
    mockPrismaClient.schedule.findMany.mockResolvedValueOnce([mockRecord]);

    const res = await request(app)
      .get('/api/schedules')
      .query({ startDate: '2026-10-01', endDate: '2026-10-31' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveLength(1);
  });

  it('supports ?month parameter on /api/schedules directly', async () => {
    const mockRecord = createMockScheduleRecord();
    mockPrismaClient.schedule.findMany.mockResolvedValueOnce([mockRecord]);

    const res = await request(app)
      .get('/api/schedules')
      .query({ month: '2026-11' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveLength(1);
  });

  it('falls back to week schedule when no range params are provided', async () => {
    mockPrismaClient.schedule.findMany.mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/schedules')
      .query({ date: '2026-10-15', entireWeek: 'true' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toEqual([]);
  });

  it('returns single day schedule when entireWeek is false', async () => {
    mockPrismaClient.schedule.findMany.mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/schedules')
      .query({ date: '2026-10-15', entireWeek: 'false' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toEqual([]);
  });
});

describe('GET /api/schedules/current', () => {
  it('returns 200 with current week schedules', async () => {
    const mockRecord = createMockScheduleRecord();
    mockPrismaClient.schedule.findMany.mockResolvedValueOnce([mockRecord]);

    const res = await request(app).get('/api/schedules/current');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});
