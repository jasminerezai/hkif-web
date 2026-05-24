import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { mockPrismaClient } from './setup.js';
import { createTestToken, testUUID } from './helpers.js';
import bcrypt from 'bcryptjs';

// ─────────────────────────────────────────────────────────────────
// Auth Endpoints Integration Tests
// ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.restoreAllMocks();
});

// ───────────────────────────── POST /api/auth/register ─────────
describe('POST /api/auth/register', () => {
  it('registers a new user and returns 201 with user + token', async () => {
    const userId = testUUID();

    // No existing user with this email
    mockPrismaClient.profile.findUnique.mockResolvedValueOnce(null);
    // Prisma creates the user
    mockPrismaClient.profile.create.mockResolvedValueOnce({
      id: userId,
      email: 'newuser@test.com',
      profileName: 'New User',
      role: 'MEMBER',
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'newuser@test.com', password: 'password123', name: 'New User' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user).toMatchObject({
      id: userId,
      email: 'newuser@test.com',
      name: 'New User',
      role: 'MEMBER',
    });
    expect(res.body.data.token).toBeDefined();
  });

  it('returns 409 when email already exists', async () => {
    mockPrismaClient.profile.findUnique.mockResolvedValueOnce({
      id: testUUID(),
      email: 'existing@test.com',
      role: 'MEMBER',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'existing@test.com', password: 'password123', name: 'User' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'valid@test.com', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// ───────────────────────────── POST /api/auth/login ────────────
describe('POST /api/auth/login', () => {
  it('logs in with valid credentials and returns 200 with token', async () => {
    const userId = testUUID();
    const hashedPw = await bcrypt.hash('password123', 10);

    // READ.findUserByEmail uses prisma.profile.findUnique
    mockPrismaClient.profile.findUnique.mockResolvedValueOnce({
      id: userId,
      email: 'user@test.com',
      profileName: 'Test User',
      password: hashedPw,
      role: 'MEMBER',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.email).toBe('user@test.com');
    expect(res.body.data.token).toBeDefined();
  });

  it('returns 401 for non-existent user', async () => {
    mockPrismaClient.profile.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    const hashedPw = await bcrypt.hash('correctpassword', 10);

    mockPrismaClient.profile.findUnique.mockResolvedValueOnce({
      id: testUUID(),
      email: 'user@test.com',
      profileName: 'Test User',
      password: hashedPw,
      role: 'MEMBER',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bad-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// ───────────────────────────── GET /api/auth/me ────────────────
describe('GET /api/auth/me', () => {
  it('returns 200 with user data when authenticated', async () => {
    const userId = testUUID();
    const token = createTestToken(userId, 'MEMBER');

    // authMiddleware does prisma.profile.findUnique to verify user exists
    mockPrismaClient.profile.findUnique.mockResolvedValueOnce({
      id: userId,
      role: 'MEMBER',
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user).toMatchObject({
      id: userId,
      role: 'MEMBER',
    });
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('returns 500 when token is malformed (unhandled JWT error)', async () => {
    // NOTE: verifyToken throws JsonWebTokenError which is not an ApiError,
    // so the global error handler returns 500. This is existing behaviour —
    // a future improvement could catch it in authMiddleware and return 401.
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
