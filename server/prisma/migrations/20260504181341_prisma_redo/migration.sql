/*
  Warnings:

  - You are about to drop the `favorites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `participation_log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `template_activity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "fk_favorites_activity_id";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "fk_favorites_profile_id";

-- DropForeignKey
ALTER TABLE "participation_log" DROP CONSTRAINT "fk_participation_activity";

-- DropForeignKey
ALTER TABLE "participation_log" DROP CONSTRAINT "fk_participation_profile";

-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "fk_schedule_activity_id";

-- DropForeignKey
ALTER TABLE "template_activity" DROP CONSTRAINT "fk_template_activity_leader";

-- DropTable
DROP TABLE "favorites";

-- DropTable
DROP TABLE "participation_log";

-- DropTable
DROP TABLE "profile";

-- DropTable
DROP TABLE "schedule";

-- DropTable
DROP TABLE "template_activity";

-- DropEnum
DROP TYPE "activity_status";

-- DropEnum
DROP TYPE "prof_role";
