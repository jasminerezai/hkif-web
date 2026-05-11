import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // https://www.prisma.io/docs/orm/reference/prisma-config-reference#engine
    url: env("DATABASE_URL"), // process.env.DATABASE_URL
  },
});
