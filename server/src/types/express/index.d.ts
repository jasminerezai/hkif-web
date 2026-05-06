import { ProfileRole } from '../../db/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string | null;
        role: ProfileRole;
      };
    }
  }
}
