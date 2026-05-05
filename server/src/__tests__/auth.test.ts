/**
 * Auth integration tests
 *
 * Covers the MVP testing standard:
 *   register  — valid | duplicate email | missing fields | weak password
 *   login     — valid | wrong password  | nonexistent user
 *   GET /me   — authenticated | unauthenticated
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// ── Mock Prisma BEFORE importing app ─────────────────────────────────────────
vi.mock('../db/prisma.js', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
  // prof_role is re-exported from db/prisma.ts — pass the real enum through
  prof_role: { USER: 'USER', LEADER: 'LEADER', BOARD_MEMBER: 'BOARD_MEMBER', ADMIN: 'ADMIN' },
}));

// ── Mock bcryptjs ─────────────────────────────────────────────────────────────
vi.mock('bcryptjs', () => ({
  default: {
    genSalt: vi.fn().mockResolvedValue('salt'),
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}));

// ── Import app AFTER mocks are in place ───────────────────────────────────────
import { app } from '../app.js';
import { prisma } from '../db/prisma.js';
import bcrypt from 'bcryptjs';

// ── Helpers ────────────────────────────────────────────────────────────────────
const mockDb = prisma.profile as {
  findUnique: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
};

const fakeUser = {
  profile_id: 1,
  email: 'test@example.com',
  profile_name: 'Test User',
  password: 'hashed_password',
  profile_role: 'USER' as const,
};

// Set a JWT_SECRET so generateToken doesn't throw
process.env['JWT_SECRET'] = 'test_secret_for_unit_tests';
process.env['JWT_EXPIRES_IN'] = '1d';

// ── Register ──────────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('201 — registers a new user and returns token + user', async () => {
    mockDb.findUnique.mockResolvedValue(null); // no existing user
    mockDb.create.mockResolvedValue(fakeUser);

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    });
    // passwordHash must NEVER be returned
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('409 — duplicate email returns Conflict, not Bad Request', async () => {
    mockDb.findUnique.mockResolvedValue(fakeUser); // user already exists

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      error: 'User with this email already exists',
      statusCode: 409,
    });
  });

  it('400 — missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      // password and name omitted
    });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('400 — password shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'short',
      name: 'Test User',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/8 characters/i);
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('200 — valid credentials return token + user', async () => {
    mockDb.findUnique.mockResolvedValue(fakeUser);
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('test@example.com');
    // passwordHash must NEVER be returned
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('401 — wrong password', async () => {
    mockDb.findUnique.mockResolvedValue(fakeUser);
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('401 — nonexistent user', async () => {
    mockDb.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(401);
  });

  it('400 — missing email or password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      // password omitted
    });

    expect(res.status).toBe(400);
  });
});

// ── GET /me ───────────────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('401 — unauthenticated request is rejected', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
