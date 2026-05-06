import './bootstrap' // just for the development process
import {prisma} from "./prisma";
import {startAndEndOfWeek} from "../utils/weekCalculator";
// import {ActivityStatus} from '../generated/prisma/enums'
import {ActivityTemplateModel} from '../generated/prisma/models'

/*
READ Queries
    entire single user profile (on logIn)
        include: favorites, leads, & participations
    *currently by id, do name in FE and send only id?*
    all users favoriting an activity (by name)X
    all activities updated after a given timestamp
 */

// const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
export default class READ{


    /**
     *  - queries DB for the current schedule, includes activities
     *
     *  RETURN:
     *  returns an array of
     *      schedule objects,
     *      including the ActivityTemplate,
     *      ordered by ascending dates (activities on monday come first, those on sunday come last)
     *
     * below an example element of the array
     * {
     *     id: 'a2befa66-576e-46ba-b9af-8b997af84217',
     *     activityId: '40a25eb7-694c-4560-b1c6-b23729b215ec',
     *     startAt: 2026-05-10T15:00:00.711Z,
     *     endAt: null,
     *     status: 'CANCELLED',
     *     createdAt: 2026-05-05T09:51:01.749Z,
     *     updatedAt: 2026-05-05T09:51:01.749Z,
     *     activity: {
     *       id: '40a25eb7-694c-4560-b1c6-b23729b215ec',
     *       name: 'Swimming',
     *       description: 'Swimming session',
     *       location: 'Location 4',
     *       maxCapacity: 16,
     *       defaultStatus: 'ACTIVE',
     *       notes: null,
     *       createdAt: 2026-05-05T09:51:01.596Z,
     *       updatedAt: 2026-05-05T09:51:01.596Z
     *     }
     *   }
     */
    static async currentSchedule() {
        const nowDate: Date = new Date(); // for next weeks query we could just add 7? for the week after +14? usw.
        return await this.anyWeekSchedule(nowDate)
    }

    static async anyWeekSchedule(date: Date){//startDay: Date, endDay: Date
            const {startDay, endDay} = startAndEndOfWeek(date)


            // PART B - QUERY
            let schedule: object[] | undefined;
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

    /*static async anyDaySchedule(date: Date){
        const onlyDay = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
        const schedule = await prisma.schedule.findMany({
            where: {
                startAt: {
                    startsWith: onlyDay
                }
            },
            orderBy:{
                startAt: "asc"
            },
            include: {
                activity: true
            }
        })
    }*/



    static async partipantsOf(scheduleId: string){
        const participants = await prisma.participationLog.findMany({
            where: { scheduleId },
            include: {
                profile: true,
            },
        });
        return participants;
    }

    static async favoritedBy(profileId: string){
        let favorites = await prisma.favorite.findMany({
            where: { profileId },
            include: {
                activity: true
            },
            omit: {
                profileId: true,
                activityId: true
            }
        })
        let favs: ActivityTemplateModel[] = [];
        favorites.map(f => favs.push(f.activity))
        return favs;
        /*let fav = await prisma.profile.findMany({
            where: { id: profileId},
            include: {
                favorites: {
                    include: {
                        activity: true
                    }
                }
            },
        })
        return fav;*/
    }

    static async profilesFavorited(activityId: string){
        let profilesFavorited = await prisma.favorite.findMany({
            where: { activityId },
            include: {
                profile: true
            },
            // select: {
            //     profile: true
            // }
        });
        // profilesFavorites.map(element => {return element.profile})
        // return profilesFavorites;
        // let profilesFavorited = await prisma.activityTemplate.findFirst({
        //     where: {
        //         id: activityId
        //     },
        //     select: {
        //         favorites: {
        //             select: {
        //                 profileId: {
        //                     include: {
        //                         profile: true
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // })

        // profilesFavorited.map(el => { return {profile} = el })
        return profilesFavorited;
    }

    // static async

}

async function main(){
    // console.log(await READ.currentSchedule());
    // console.log(await READ.profilesFavorited("6233715d-5631-4e2b-8236-2d39ec323b47"))
    // console.log(await READ.partipantsOf("ae787f1c-3221-47a0-8694-13fc56e47345"))
    console.log(await READ.favoritedBy('e420ecca-8662-4929-9052-9835a016a53b'))
    // console.log(await prisma.favorite.findMany({
    //     select:{
    //         profileId: true
    //     }
    // }))
}
main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect())