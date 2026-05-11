import { prisma } from "./prisma";
import { startAndEndOfWeek } from "../utils/weekCalculator";
import { ActivityTemplateModel, ScheduleModel } from "../generated/prisma/models";

export default class READ {
    /**
     * Purpose: returns the current schedule of the week
     * @return (Schedule&Activity)[] OR undefined ==> see anyWeekSchedule(date: Date) for more details
     */
    static async currentSchedule(): Promise<ScheduleModel[] | undefined> {
        const nowDate: Date = new Date(); // for next weeks query we could just add 7? for the week after +14? usw.
        return await this.anyWeekSchedule(nowDate);
    }


    /**
     * Given any date, it returns the weeks schedule of the week the date is in.
     * @param date any valid date
     * @return (Schedule&Activity)[] OR undefined
     *      **SUCCESS**
     *      --> array of that weeks schedule w/ the activities nested inside,
     *              ordered by ascending dates (mondays actvities first, sundays last)
     *      **FAIL**
     *      --> undefined if no activities have been scheduled for the week you are looking for
     */
    static async anyWeekSchedule(date: Date): Promise<ScheduleModel[] | undefined> {//startDay: Date, endDay: Date
        const { startDay, endDay } = startAndEndOfWeek(date);
        // PART B - QUERY
        let schedule: ScheduleModel[] | undefined;
        if (startDay && endDay) {
            schedule = await prisma.schedule.findMany({
                where: {
                    AND: [
                        { startAt: { gte: startDay } },
                        { startAt: { lte: endDay } }
                    ]
                },
                orderBy: {
                    startAt: "asc"
                },
                include: {
                    activity: true
                }
            });
        }
        if (schedule?.length === 0) {
            return undefined;
        }
        return schedule;
    }


    static async anyDaySchedule(date: Date): Promise<ScheduleModel[] | undefined> {
        const startDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        const endDay = new Date(Date.UTC(startDay.getUTCFullYear(), startDay.getUTCMonth(), startDay.getUTCDate() + 1));
        const schedule = await prisma.schedule.findMany({
            where: {
                startAt: {
                    gte: startDay,
                    lt: endDay
                },
            },
            orderBy: {
                startAt: "asc"
            },
            include: {
                activity: true
            }
        });
        return schedule;
    }


    /**
     * If a user is found in the table, they participated in the activity.
     * @param scheduleId 
     * @return (ParticipationLogModel & ProfileModel)[]
     *      **SUCCESS**
     *      --> Array of the participation log, including the profile
     *      **FAIL**
     *      --> empty array
     */
    static async participantsOf(scheduleId: string) {
        const participants = await prisma.schedule.findUnique({
            where: { id: scheduleId },
            select: {
                participations: {
                    select: {
                        profile: true
                    }
                }
            }
        });
        return participants?.participations.map(el => el.profile);
    }


    static async activityById(activityId: string): Promise<ActivityTemplateModel | null> {
        const activity = await prisma.activityTemplate.findUnique({
            where: { id: activityId }
        });
        return activity;
    }


    static async allActivities() {
        let activities = await prisma.activityTemplate.findMany({
            include: {
                timeSlots: true,
                leaders: true
            },
        });
        return activities;
    }
}
