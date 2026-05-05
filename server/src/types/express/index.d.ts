import { prof_role } from '../../generated/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        role: prof_role;
      };
    }
  }
}
