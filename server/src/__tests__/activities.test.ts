import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { mockPrismaClient } from './setup.js';
import { createTestToken, testUUID } from './helpers.js';

// ─────────────────────────────────────────────────────────────────
// Activities & Participation Endpoints Integration Tests
// ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.restoreAllMocks();
});

// ───────────────────── GET /api/activities ──────────────────────
describe('GET /api/activities', () => {
  it('returns 200 with a list of activities', async () => {
    const activityId = testUUID();

    mockPrismaClient.activityTemplate.findMany.mockResolvedValueOnce([
      {
        id: activityId,
        name: 'Football',
        location: 'Stadium',
        description: 'Weekly football',
        maxCapacity: 20,
        defaultStatus: 'ACTIVE',
        notes: null,
        timeSlots: [],
        leaders: [
          { profile: { id: testUUID(), profileName: 'Coach' } },
        ],
      },
    ]);

    const res = await request(app).get('/api/activities');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Football');
    expect(res.body.data[0].leaders).toHaveLength(1);
  });

  it('returns 200 with empty array when no activities exist', async () => {
    mockPrismaClient.activityTemplate.findMany.mockResolvedValueOnce([]);

    const res = await request(app).get('/api/activities');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toEqual([]);
  });
});

// ───────────────── GET /api/activities/:activityId ──────────────
describe('GET /api/activities/:activityId', () => {
  it('returns 200 with activity data for a valid UUID', async () => {
    const activityId = testUUID();

    mockPrismaClient.activityTemplate.findUnique.mockResolvedValueOnce({
      id: activityId,
      name: 'Yoga',
      location: 'Studio A',
      description: 'Morning yoga',
      maxCapacity: 15,
      defaultStatus: 'ACTIVE',
      notes: null,
      timeSlots: [],
      leaders: [],
    });

    const res = await request(app).get(`/api/activities/${activityId}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.id).toBe(activityId);
    expect(res.body.data.name).toBe('Yoga');
  });

  it('returns 400 for an invalid (non-UUID) activityId', async () => {
    const res = await request(app).get('/api/activities/not-a-uuid');

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 404 when activity does not exist', async () => {
    const fakeId = testUUID();
    mockPrismaClient.activityTemplate.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).get(`/api/activities/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

// ──── POST /api/activities/:activityId/schedules/:scheduleId/participate ────
describe('POST /api/activities/:aId/schedules/:sId/participate', () => {
  it('returns 201 when authenticated user registers participation', async () => {
    const userId = testUUID();
    const activityId = testUUID();
    const scheduleId = testUUID();
    const token = createTestToken(userId, 'MEMBER');

    // authMiddleware verifies the user
    mockPrismaClient.profile.findUnique.mockResolvedValueOnce({
      id: userId,
      role: 'MEMBER',
    });

    // CREATE.registerParticipation uses $transaction
    mockPrismaClient.$transaction.mockImplementationOnce(async (fn: Function) => {
      const tx = {
        schedule: {
          findUnique: vi.fn().mockResolvedValueOnce({
            id: scheduleId,
            activityId,
            activity: { maxCapacity: 20 },
          }),
        },
        participationLog: {
          count: vi.fn()
            .mockResolvedValueOnce(5)   // capacity check
            .mockResolvedValueOnce(6),  // final count
          findUnique: vi.fn().mockResolvedValueOnce(null), // not already registered
          create: vi.fn().mockResolvedValueOnce({}),
        },
      };
      return fn(tx);
    });

    const res = await request(app)
      .post(`/api/activities/${activityId}/schedules/${scheduleId}/participate`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.participantCount).toBe(6);
  });

  it('returns 401 when no token is provided', async () => {
    const activityId = testUUID();
    const scheduleId = testUUID();

    const res = await request(app)
      .post(`/api/activities/${activityId}/schedules/${scheduleId}/participate`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for invalid UUID parameters', async () => {
    const token = createTestToken(testUUID(), 'MEMBER');

    // authMiddleware
    mockPrismaClient.profile.findUnique.mockResolvedValueOnce({
      id: testUUID(),
      role: 'MEMBER',
    });

    const res = await request(app)
      .post('/api/activities/bad-id/schedules/also-bad/participate')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// ──── DELETE /api/activities/:activityId/schedules/:scheduleId/participate ───
describe('DELETE /api/activities/:aId/schedules/:sId/participate', () => {
  it('returns 200 when user unregisters from participation', async () => {
    const userId = testUUID();
    const activityId = testUUID();
    const scheduleId = testUUID();
    const token = createTestToken(userId, 'MEMBER');

    // authMiddleware
    mockPrismaClient.profile.findUnique.mockResolvedValueOnce({
      id: userId,
      role: 'MEMBER',
    });

    // READ.isParticipating → prisma.participationLog.findUnique
    mockPrismaClient.participationLog.findUnique.mockResolvedValueOnce({
      id: testUUID(),
      profileId: userId,
      scheduleId,
    });

    // DELETE.unregisterParticipation → prisma.participationLog.delete
    mockPrismaClient.participationLog.delete.mockResolvedValueOnce({});

    // READ.participantCount → prisma.participationLog.count
    mockPrismaClient.participationLog.count.mockResolvedValueOnce(4);

    const res = await request(app)
      .delete(`/api/activities/${activityId}/schedules/${scheduleId}/participate`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.participantCount).toBe(4);
  });

  it('returns 404 when user is not registered for the activity', async () => {
    const userId = testUUID();
    const activityId = testUUID();
    const scheduleId = testUUID();
    const token = createTestToken(userId, 'MEMBER');

    // authMiddleware
    mockPrismaClient.profile.findUnique.mockResolvedValueOnce({
      id: userId,
      role: 'MEMBER',
    });

    // READ.isParticipating returns null (not registered)
    mockPrismaClient.participationLog.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .delete(`/api/activities/${activityId}/schedules/${scheduleId}/participate`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
