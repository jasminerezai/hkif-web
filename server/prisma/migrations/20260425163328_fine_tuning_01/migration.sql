/*
  Warnings:

  - You are about to drop the column `reason` on the `favorites` table. All the data in the column will be lost.
  - The primary key for the `schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fk_scheduled_date` on the `schedule` table. All the data in the column will be lost.
  - Added the required column `scheduled_date` to the `schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "participation_log" DROP CONSTRAINT "fk_participation_activity";

-- AlterTable
ALTER TABLE "favorites" DROP COLUMN "reason";

-- AlterTable
ALTER TABLE "profile" ALTER COLUMN "profile_role" SET DEFAULT 'USER';

-- AlterTable
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_pkey",
DROP COLUMN "fk_scheduled_date",
ADD COLUMN     "scheduled_date" DATE NOT NULL,
ADD CONSTRAINT "schedule_pkey" PRIMARY KEY ("fk_activity_id", "scheduled_date");

-- AddForeignKey
ALTER TABLE "participation_log" ADD CONSTRAINT "fk_participation_activity" FOREIGN KEY ("fk_activity_id", "fk_scheduled_date") REFERENCES "schedule"("fk_activity_id", "scheduled_date") ON DELETE NO ACTION ON UPDATE NO ACTION;
