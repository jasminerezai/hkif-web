import {prisma} from "./prisma";
import {ActivityTemplateModel} from '../generated/prisma/models'

export class DELETE {
    // static async deleteActivity(activityId: string) {
    /**
     * @param profileId current user
     * @param activityId activityId to be removed from the user list of favorites
     * @return activity deleted from list of favorites
     */
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