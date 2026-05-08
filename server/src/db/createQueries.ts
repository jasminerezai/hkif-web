import {prisma} from "./prisma";
import {ActivityTemplateModel} from '../generated/prisma/models'// ProfileModel, ScheduleModel
import {postActivity} from "../types/activity.types";
/*
CREATE Queries
    create new profile
        adding favorites → use connect clause, cause the activities already exist
    create new activity
    add new time slot to an activity
    perhaps a query for attending activity, CREATE query for Participations (e.g., linking a profile_id to a time_slot_id). wdyt?
    add a new week to the schedule
 */


export default class CREATE{


    // adding favorites
    /**
     * return all favorites of the user
     *      - profileId
     *      - activityIds
     */
    static async addFavorites(profileId: string, ...activityIds: string[]):  Promise<ActivityTemplateModel[]>
    {
        const newFavs = await prisma.favorite.createManyAndReturn({
            data: activityIds.map( (activityId) => ({
                profileId,
                activityId
            })),
            skipDuplicates: true,
            select:{
                activity: true
            }
        });
        return newFavs?.map(el => el.activity);
    }
    // static async addFavs(profileId: string, ...activityIds: string[]):  Promise<ActivityTemplateModel[]>
    // {
    //     const newFavs = await prisma.profile.update({
    //         where: {id: profileId},
    //
    //     })
    // }


    static async newActivity(newAct: postActivity){
        const resAct = await prisma.activityTemplate.create({
            data: {
                name: newAct.name,
                location: newAct.location,
                description: newAct.description,
                notes: newAct.notes,
            }
        })

        const updAct = await prisma.activityTemplate.update({
            where: {id: resAct.id},
            data: {
                leaders: {
                    createMany: {
                        data: newAct.leaders.map( (profileId) => ({
                                profileId
                            }))
                    }
                },
                timeSlots: {
                    createMany: {
                        data: newAct.timeSlots.map( el => ({
                            weekday: el.weekday,
                            startTime: el.startAt,
                            endTime: el.endAt
                        }))
                    }
                }
            },
            include: {
                leaders: true,
                timeSlots: true
            }
        })

        return updAct;
    }
}