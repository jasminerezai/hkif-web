import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { mockPrismaClient } from './setup.js';
import { createTestToken, testUUID } from './helpers.js';

// ─────────────────────────────────────────────────────────────────
// Favorites Endpoints Integration Tests
//
// All routes are under /api/users and require authentication
// (the entire userRoutes router applies authMiddleware).
// ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.restoreAllMocks();
});

// ─────────────── GET /api/users/me/favorites ────────────────────
describe('GET /api/users/me/favorites', () => {
  it('returns 200 with a list of favorited activities', async () => {
    const userId = testUUID();
    const activityId = testUUID();
    const token = createTestToken(userId, 'MEMBER');

    // authMiddleware
    mockPrismaClient.profile.findUnique.mockResolvedValueOnce({
      id: userId,
      role: 'MEMBER',
    });

    // READ.activitiesFavoritedBy → prisma.favorite.findMany
    mockPrismaClient.favorite.findMany.mockResolvedValueOnce([
      {
        activity: {
          id: activityId,
          name: 'Basketball',
          location: 'Court 1',
          description: 'Weekly game',
          maxCapacity: 10,
          defaultStatus: 'ACTIVE',
          notes: null,
          timeSlots: [],
          leaders: [
            { profile: { id: testUUID(), profileName: 'Coach B' } },
          ],
        },
      },
    ]);

    const res = await request(app)
      .get('/api/users/me/favorites')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Basketball');
  });

  it('returns 200 with empty array when user has no favorites', async () => {
    const userId = testUUID();
    const token = createTestToken(userId, 'MEMBER');

    mockPrismaClient.profile.findUnique.mockResolvedValueOnce({
      id: userId,
      role: 'MEMBER',
    });

    mockPrismaClient.favorite.findMany.mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/users/me/favorites')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/users/me/favorites');

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});

// ──────────── POST /api/users/me/favorites/:activityId ─────────
describe('POST /api/users/me/favorites/:activityId', () => {
  it('returns 201 when adding a valid favorite', async () => {
    const userId = testUUID();
    const activityId = testUUID();
    const token = createTestToken(userId, 'MEMBER');

    // authMiddleware
    mockPrismaClient.profile.findUnique.mockResolvedValueOnce({
      id: userId,
      role: 'MEMBER',
    });

    // CREATE.newFavorite → prisma.favorite.create
    mockPrismaClient.favorite.create.mockResolvedValueOnce({
      activity: {
        id: activityId,
        name: 'Swimming',
        location: 'Pool',
        description: 'Lap swimming',
        maxCapacity: 8,
        defaultStatus: 'ACTIVE',
        notes: null,
        timeSlots: [],
        leaders: [],
      },
    });

    const res = await request(app)
      .post(`/api/users/me/favorites/${activityId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.name).toBe('Swimming');
  });

  it('returns 400 for invalid (non-UUID) activityId', async () => {
    const userId = testUUID();
    const token = createTestToken(userId, 'MEMBER');

    mockPrismaClient.profile.findUnique.mockResolvedValueOnce({
      id: userId,
      role: 'MEMBER',
    });

    const res = await request(app)
      .post('/api/users/me/favorites/not-a-uuid')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 401 when no token is provided', async () => {
    const activityId = testUUID();

    const res = await request(app)
      .post(`/api/users/me/favorites/${activityId}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});

// ──────────── DELETE /api/users/me/favorites/:activityId ────────
describe('DELETE /api/users/me/favorites/:activityId', () => {
  it('returns 204 when removing a favorite', async () => {
    const userId = testUUID();
    const activityId = testUUID();
    const token = createTestToken(userId, 'MEMBER');

    // authMiddleware
    mockPrismaClient.profile.findUnique.mockResolvedValueOnce({
      id: userId,
      role: 'MEMBER',
    });

    // DELETE.deleteFavorite → prisma.favorite.delete
    mockPrismaClient.favorite.delete.mockResolvedValueOnce({
      activity: {
        id: activityId,
        name: 'Swimming',
        location: 'Pool',
        description: null,
        maxCapacity: null,
        defaultStatus: 'ACTIVE',
        notes: null,
        timeSlots: [],
        leaders: [],
      },
    });

    const res = await request(app)
      .delete(`/api/users/me/favorites/${activityId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('returns 400 for invalid (non-UUID) activityId', async () => {
    const userId = testUUID();
    const token = createTestToken(userId, 'MEMBER');

    mockPrismaClient.profile.findUnique.mockResolvedValueOnce({
      id: userId,
      role: 'MEMBER',
    });

    const res = await request(app)
      .delete('/api/users/me/favorites/not-a-uuid')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 401 when no token is provided', async () => {
    const activityId = testUUID();

    const res = await request(app)
      .delete(`/api/users/me/favorites/${activityId}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});
