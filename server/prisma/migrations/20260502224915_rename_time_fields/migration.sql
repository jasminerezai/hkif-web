/*
  Warnings:

  - You are about to drop the column `registered_at` on the `participation_log` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled_time` on the `schedule` table. All the data in the column will be lost.
  - Added the required column `start_time` to the `schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "participation_log" DROP COLUMN "registered_at",
ADD COLUMN     "signed_up_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "schedule" DROP COLUMN "scheduled_time",
ADD COLUMN     "start_time" TIME(6) NOT NULL;
