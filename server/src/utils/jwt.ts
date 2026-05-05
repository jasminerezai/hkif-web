import jwt from 'jsonwebtoken';
import { prof_role } from '../db/prisma.js';

export interface JwtPayload {
  /**
   * profile_id from the Prisma `profile` model — typed as `number` because
   * the schema uses `Int @id @default(autoincrement())`.
   */
  id: number;
  role: prof_role;
}

export const generateToken = (id: number, role: prof_role): string => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const expiresIn = process.env['JWT_EXPIRES_IN'] || '7d';

  return jwt.sign({ id, role }, secret, {
    expiresIn,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.verify(token, secret) as JwtPayload;
};
