import * as z from 'zod';
import { ProfileRole } from '../db/prisma.js';

export const GetProfilesQuerySchema = z.object({
  role: z.nativeEnum(ProfileRole).optional(),
});
