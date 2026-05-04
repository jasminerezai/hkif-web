/*
  Warnings:

  - The values [BORD_MEMBER] on the enum `prof_role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `week_nr` on the `schedule` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - Made the column `expressed_interest` on table `participation_log` required. This step will fail if there are existing NULL values in that column.
  - Made the column `participated` on table `participation_log` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updated_at` to the `profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `template_activity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "prof_role_new" AS ENUM ('USER', 'LEADER', 'BOARD_MEMBER', 'ADMIN');
ALTER TABLE "public"."profile" ALTER COLUMN "profile_role" DROP DEFAULT;
ALTER TABLE "profile" ALTER COLUMN "profile_role" TYPE "prof_role_new" USING ("profile_role"::text::"prof_role_new");
ALTER TYPE "prof_role" RENAME TO "prof_role_old";
ALTER TYPE "prof_role_new" RENAME TO "prof_role";
DROP TYPE "public"."prof_role_old";
ALTER TABLE "profile" ALTER COLUMN "profile_role" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "participation_log" ADD COLUMN     "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "expressed_interest" SET NOT NULL,
ALTER COLUMN "expressed_interest" SET DEFAULT false,
ALTER COLUMN "participated" SET NOT NULL,
ALTER COLUMN "participated" SET DEFAULT false;

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "schedule" ADD COLUMN     "end_time" TIME(6),
ALTER COLUMN "week_nr" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "template_activity" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "max_capacity" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "description" SET DATA TYPE VARCHAR(500);

-- AddForeignKey
ALTER TABLE "participation_log" ADD CONSTRAINT "fk_participation_profile" FOREIGN KEY ("fk_profile_id") REFERENCES "profile"("profile_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
