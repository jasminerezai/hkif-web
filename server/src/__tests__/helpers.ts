/**
 * Shared test utilities — token generation and UUID helpers.
 */

import { randomUUID } from 'node:crypto';
import { generateToken } from '../utils/jwt.js';

/** Generates a valid JWT for the given user id and role. */
export function createTestToken(
  id: string = randomUUID(),
  role: 'MEMBER' | 'LEADER' | 'BOARD_MEMBER' | 'ADMIN' = 'MEMBER',
): string {
  // generateToken reads JWT_SECRET from process.env (set in setup.ts)
  return generateToken(id, role as any);
}

/** Shorthand — returns a fresh UUID v4 string. */
export function testUUID(): string {
  return randomUUID();
}
