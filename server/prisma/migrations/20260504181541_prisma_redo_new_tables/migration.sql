-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED', 'DELAYED');

-- CreateEnum
CREATE TYPE "ProfileRole" AS ENUM ('USER', 'LEADER', 'BOARD_MEMBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "role" "ProfileRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityTemplate" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500),
    "location" VARCHAR(255) NOT NULL,
    "maxCapacity" INTEGER,
    "defaultStatus" "ActivityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "status" "ActivityStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "weekday" "Weekday" NOT NULL,
    "startTime" TIME(6) NOT NULL,
    "endTime" TIME(6) NOT NULL,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderActivity" (
    "profileId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,

    CONSTRAINT "LeaderActivity_pkey" PRIMARY KEY ("profileId","activityId")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "profileId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("profileId","activityId")
);

-- CreateTable
CREATE TABLE "ParticipationLog" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "interested" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ParticipationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- CreateIndex
CREATE INDEX "Profile_email_idx" ON "Profile"("email");

-- CreateIndex
CREATE INDEX "ActivityTemplate_name_idx" ON "ActivityTemplate"("name");

-- CreateIndex
CREATE INDEX "Schedule_activityId_idx" ON "Schedule"("activityId");

-- CreateIndex
CREATE INDEX "Schedule_startAt_idx" ON "Schedule"("startAt");

-- CreateIndex
CREATE INDEX "TimeSlot_activityId_weekday_idx" ON "TimeSlot"("activityId", "weekday");

-- CreateIndex
CREATE UNIQUE INDEX "TimeSlot_activityId_weekday_startTime_key" ON "TimeSlot"("activityId", "weekday", "startTime");

-- CreateIndex
CREATE INDEX "ParticipationLog_scheduleId_idx" ON "ParticipationLog"("scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipationLog_profileId_scheduleId_key" ON "ParticipationLog"("profileId", "scheduleId");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ActivityTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ActivityTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderActivity" ADD CONSTRAINT "LeaderActivity_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderActivity" ADD CONSTRAINT "LeaderActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ActivityTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ActivityTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipationLog" ADD CONSTRAINT "ParticipationLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipationLog" ADD CONSTRAINT "ParticipationLog_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
