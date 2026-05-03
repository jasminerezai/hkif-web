import { prof_role } from '../../generated/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: prof_role;
      };
    }
  }
}
