/*
DELETE Queries
    remove time slot of an activity
    delete activity --> note cascade effect
    delete profile --> note cascade effect
    delete participation logs older than 6 months
 */
import {prisma} from "./prisma";
// import {BatchPayload} from '../generated/prisma/internal/prismaNamespace'
import {ActivityTemplateModel} from '../generated/prisma/models'

export default class DELETE{


    static async deleteFavorite(profileId: string, activityId: string): Promise<ActivityTemplateModel>
    {
        const {activity} = await prisma.favorite.delete({
            where: {
                profileId_activityId: {
                    profileId,
                    activityId
                }
            },
            select: {
                activity: true
            }
        })

        return activity;
    }

    static async deleteActivity(activityId: string)
    {
        const res = await prisma.activityTemplate.delete({
            where: {id: activityId}
        })
        return res;
    }
}