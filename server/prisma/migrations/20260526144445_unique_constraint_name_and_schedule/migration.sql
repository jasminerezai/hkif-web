/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ActivityTemplate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[activityId,startAt]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ActivityTemplate_name_key" ON "ActivityTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_activityId_startAt_key" ON "Schedule"("activityId", "startAt");
