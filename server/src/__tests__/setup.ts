/**
 * Global test setup — runs before every test file.
 *
 * 1. Injects env vars so JWT helpers and other code that reads process.env work.
 * 2. Mocks the Prisma singleton (`src/db/prisma.ts`) so no real DB connection
 *    is attempted.  Each test file can further configure mock return values.
 * 3. Mocks the query barrel files (`readQueries`, `createQueries`,
 *    `deleteQueries`) because controllers import the static `READ / CREATE /
 *    DELETE` classes which internally call `prisma.*`.  Mocking at this layer
 *    is simpler and keeps tests focused on the HTTP ↔ controller contract.
 */

import { vi } from 'vitest';

// ── 1. Environment ──────────────────────────────────────────────
process.env['JWT_SECRET'] = 'test_secret_key_for_vitest_only';
process.env['JWT_EXPIRES_IN'] = '1h';
process.env['PORT'] = '3002';

// ── 2. Mock Prisma client ───────────────────────────────────────
//
// We replace the real `prisma` export with an object whose nested
// methods are Vitest spies.  Tests call e.g.
//   vi.mocked(prisma.profile.findUnique).mockResolvedValueOnce(...)

const mockPrismaClient = {
  profile: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  activityTemplate: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  schedule: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  participationLog: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  favorite: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  leaderActivity: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock('../db/prisma.js', () => ({
  prisma: mockPrismaClient,
  ProfileRole: {
    MEMBER: 'MEMBER',
    LEADER: 'LEADER',
    BOARD_MEMBER: 'BOARD_MEMBER',
    ADMIN: 'ADMIN',
  },
  ActivityStatus: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    CANCELLED: 'CANCELLED',
    DELAYED: 'DELAYED',
  },
  Weekday: {
    MONDAY: 'MONDAY',
    TUESDAY: 'TUESDAY',
    WEDNESDAY: 'WEDNESDAY',
    THURSDAY: 'THURSDAY',
    FRIDAY: 'FRIDAY',
    SATURDAY: 'SATURDAY',
    SUNDAY: 'SUNDAY',
  },
}));

export { mockPrismaClient };
