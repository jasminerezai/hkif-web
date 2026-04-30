/*
  Warnings:

  - You are about to drop the column `leader` on the `template_activity` table. All the data in the column will be lost.
  - Added the required column `fk_leader` to the `template_activity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "template_activity" DROP CONSTRAINT "fk_template_activity_leader";

-- AlterTable
ALTER TABLE "template_activity" DROP COLUMN "leader",
ADD COLUMN     "fk_leader" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "template_activity" ADD CONSTRAINT "fk_template_activity_leader" FOREIGN KEY ("fk_leader") REFERENCES "profile"("profile_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
