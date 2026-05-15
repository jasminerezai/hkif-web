import jwt, { type SignOptions } from 'jsonwebtoken';
import { ProfileRole } from '../db/prisma.js';

export interface JwtPayload {
  /**
   * id from the Prisma `Profile` model — typed as `string` because
   * the schema uses `String @id @default(uuid())`.
   */
  id: string;
  role: ProfileRole;
}

export const generateToken = (id: string, role: ProfileRole): string => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const options: SignOptions = {
    expiresIn: (process.env['JWT_EXPIRES_IN'] ?? '7d') as SignOptions['expiresIn'],
  };

  return jwt.sign({ id, role }, secret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.verify(token, secret) as JwtPayload;
};
