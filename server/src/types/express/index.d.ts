import { ProfileRole } from '../../db/prisma.js';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: ProfileRole;
        // name and email are NOT in the JWT payload ({ id, role } only).
        // Fetch them from DB in specific handlers when needed:
        //   prisma.profile.findUnique({ where: { id: req.user.id } })
      };
    }
  }
}
