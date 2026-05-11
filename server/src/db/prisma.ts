import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "../generated/prisma";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };

// Re-export Prisma enums so all code imports from this singleton
// instead of directly from the generated client.
export { ProfileRole } from '../generated/prisma';
export { ActivityStatus } from '../generated/prisma';
export { Weekday } from '../generated/prisma';
