import { ProfileRole } from '../db/prisma.js';

/** Public user representation returned by auth endpoints (no password). */
export interface UserDto {
  id: string;
  email: string;
  name: string | null;
  role: ProfileRole;
}

/** Returned by POST /auth/register and POST /auth/login. */
export interface AuthResponseDto {
  user: UserDto;
  token: string;
}

/** Returned by GET /auth/me. */
export interface MeResponseDto {
  user: {
    id: string;
    role: ProfileRole;
  };
}
