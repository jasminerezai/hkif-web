import {prisma} from "./prisma";
import {startAndEndOfWeek} from "../utils/weekCalculator";
import {ActivityTemplateModel, ProfileModel, ScheduleModel} from '../generated/prisma/models'

/**
 * Contains all READ-queries to the DB.
 * Only has static functions.
 * Send back timestamp when the last query to the schedule was?
 */
export default class READ{


    /**
     * Purpose: returns the current schedule of the week
     * @return (Schedule&Activity)[] OR undefined ==> see anyWeekSchedule(date: Date) for more details
     */
    static async currentSchedule(): Promise<ScheduleModel[] | undefined>
    {
        const nowDate: Date = new Date(); // for next weeks query we could just add 7? for the week after +14? usw.
        return await this.anyWeekSchedule(nowDate)
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
    static async anyWeekSchedule(date: Date) : Promise<ScheduleModel[] | undefined> //will return empty list if nothing
    {//startDay: Date, endDay: Date
            const {startDay, endDay} = startAndEndOfWeek(date)
            // PART B - QUERY
            let schedule: ScheduleModel[] | undefined;
            if(startDay && endDay) {
                schedule = await prisma.schedule.findMany({
                    where: {
                        AND: [
                            { startAt: { gte: startDay } },
                            { startAt: { lte: endDay} }
                        ]
                    },
                    orderBy:{
                        startAt: "asc"
                    },
                    include: {
                        activity: true
                    }
                })
            }
            if(schedule?.length === 0){
                return undefined;
            }
            return schedule;
    }

    static async anyDaySchedule(date: Date) : Promise<ScheduleModel[] | undefined> //will return empty list if nothing
    {
        const startDay = new Date( Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) )
        const endDay = new Date( Date.UTC(startDay.getUTCFullYear(), startDay.getUTCMonth(), startDay.getUTCDate() + 1 ))
        const schedule = await prisma.schedule.findMany({
            where: {
                startAt: {
                    gte: startDay,
                    lt: endDay
                },
            },
            orderBy:{
                startAt: "asc"
            },
            include: {
                activity: true
            }
        });
        return schedule;
    }


    /**
     * @param profileId --> requires to be logged-in, i.e. we need an account
     * @return Promise<ActivityTemplateModel[]>
     *     **FAIL**
     *     --> is empty if the profile doesn't have favorite activities
     *     **SUCCESS**
     *     --> array of ActivityTemplateModel objects
     */
    static async activitiesFavoritedBy(profileId: string): Promise<ActivityTemplateModel[]  | undefined>
    {

        let favorites = await prisma.favorite.findMany({
            where: { profileId },
            include: {
                activity: true
            },
            omit: {
                profileId: true,
                activityId: true,
            }
        })
        let favs: ActivityTemplateModel[] = [];
        favorites.map(f => favs.push(f.activity))
        return favs;
    }


    // all activities updated after a given timestamp
    // static async activitiesUpdatedAfter(lastRequest: Date){}


    /**
     * returns user based of their unique email
     * QUESTION: include favorites & participationLog? --> active loading OR lazy loading
     * @param email string
     * @return Promise<ProfileModel | undefined>
     *     ---> ProfileModel: successful query
     *     ---> undefined: unsuccessful query
     */
    static async logIn(email: string): Promise<ProfileModel | null>
    {
        let loggedInUser = await prisma.profile.findUnique({
            where: {
                email
            }
            /*
            include: {
                favorites: true,
            }
             */
        })
        return loggedInUser
    }


    /**
     * just returns all activityTemplates
     */
    static async allActivities(){
        let activities = await prisma.activityTemplate.findMany();
        return activities;
    }


    /**
     * returns array of profiles that favorited the activity by id
     * --> change to activity name?
     * @param activityId
     */
    static async profilesFavorited(activityId: string): Promise<ProfileModel[]>
    {
        const profilesFavorited = await prisma.activityTemplate.findUnique({
            where: {id: activityId},
            select: {
                favorites: {
                    select: {
                        profile: true
                    }
                }
            }
        })
        return profilesFavorited?.favorites.map(el => el.profile) ?? [];
    }

    /**
     * If a user is found in the table, they participated in the activity.
     * @param scheduleId --> change to activityName & date?
     * @return (ParticipationLogModel & ProfileModel)[]
     *      **SUCCESS**
     *      --> Array of the participation log, including the profile
     *      **FAIL**
     *      --> empty array
     */
    static async partipantsOf(scheduleId: string)
    {
        //Promise<({profile: ProfileModel & ParticipationLogModel})[]>
        // const participants = await prisma.participationLog.findMany({
        //     where: { scheduleId },
        //     include: {
        //         profile: true,
        //     },
        // });
        // return participants;
        const participants = await prisma.schedule.findUnique({
            where:{id: scheduleId},
            select:{
                participations: {
                    select: {
                        profile: true
                    }
                }
            }
        })
        return participants?.participations.map(el => el.profile);
    }
}

// async function main(){
    // console.log(await READ.currentSchedule());
    // console.log(await READ.profilesFavorited("6233715d-5631-4e2b-8236-2d39ec323b47"))
    // console.log(await READ.partipantsOf("ae787f1d-3221-47a0-8694-13fc56e47345"))
    // console.log(await READ.favoritedBy('e420ecca-8662-4929-9052-9835a016a53b'))
    // console.log(await READ.logIn('e420ecca-8662-4929-9052-9835a016a53b'))
// }
// main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect())