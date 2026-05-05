/*
  Warnings:

  - Added the required column `notes` to the `ActivityTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivityTemplate" ADD COLUMN     "notes" VARCHAR(500) NOT NULL;
