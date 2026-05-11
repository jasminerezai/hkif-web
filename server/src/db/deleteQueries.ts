import {prisma} from "./prisma";
import {ActivityTemplateModel} from '../generated/prisma/models'

export class DELETE {
    // static async deleteActivity(activityId: string) {
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
            where: { id: activityId }
        });
        return res;
    }
}