-- CreateEnum
CREATE TYPE "activity_status" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED', 'DELAYED');

-- CreateEnum
CREATE TYPE "prof_role" AS ENUM ('USER', 'LEADER', 'BORD_MEMBER', 'ADMIN');

-- CreateTable
CREATE TABLE "favorites" (
    "fk_profile_id" INTEGER NOT NULL,
    "fk_activity_id" INTEGER NOT NULL,
    "reason" TEXT,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("fk_profile_id","fk_activity_id")
);

-- CreateTable
CREATE TABLE "participation_log" (
    "fk_activity_id" INTEGER NOT NULL,
    "fk_scheduled_date" DATE NOT NULL,
    "fk_profile_id" INTEGER NOT NULL,
    "expressed_interest" BOOLEAN,
    "participated" BOOLEAN,

    CONSTRAINT "participation_log_pkey" PRIMARY KEY ("fk_activity_id","fk_scheduled_date","fk_profile_id")
);

-- CreateTable
CREATE TABLE "profile" (
    "profile_id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "profile_name" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "profile_role" "prof_role" NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "schedule" (
    "week_nr" BIGINT NOT NULL,
    "fk_activity_id" INTEGER NOT NULL,
    "fk_scheduled_date" DATE NOT NULL,
    "status" "activity_status" NOT NULL,
    "scheduled_time" TIME(6) NOT NULL,
    "last_change" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "schedule_pkey" PRIMARY KEY ("fk_activity_id","fk_scheduled_date")
);

-- CreateTable
CREATE TABLE "template_activity" (
    "activity_id" SERIAL NOT NULL,
    "activity_name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "location" VARCHAR(30) NOT NULL,
    "time_slots" JSON NOT NULL,
    "leader" INTEGER NOT NULL,
    "default_status" "activity_status" NOT NULL,

    CONSTRAINT "template_activity_pkey" PRIMARY KEY ("activity_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_email_key" ON "profile"("email");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "fk_favorites_activity_id" FOREIGN KEY ("fk_activity_id") REFERENCES "template_activity"("activity_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "fk_favorites_profile_id" FOREIGN KEY ("fk_profile_id") REFERENCES "profile"("profile_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "participation_log" ADD CONSTRAINT "fk_participation_activity" FOREIGN KEY ("fk_activity_id", "fk_scheduled_date") REFERENCES "schedule"("fk_activity_id", "fk_scheduled_date") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "fk_schedule_activity_id" FOREIGN KEY ("fk_activity_id") REFERENCES "template_activity"("activity_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "template_activity" ADD CONSTRAINT "fk_template_activity_leader" FOREIGN KEY ("leader") REFERENCES "profile"("profile_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
