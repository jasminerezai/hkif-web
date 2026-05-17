import {prisma} from "./prisma.js";
import {ActivityDto, FavoriteCreateDelete} from "../types/index.js";

export class DELETE {
    /**
     * @param ids see favorite.types.ts
     * @return activity deleted from list of favorites
     */
    static async deleteFavorite(ids: FavoriteCreateDelete): Promise<ActivityDto>
    {
        const {activity} = await prisma.favorite.delete({
            where: {
                profileId_activityId: {
                    profileId: ids.profileId,
                    activityId: ids.activityId,
                }
            },
            select: {
                activity: {
                    include: {
                        leaders: true,
                        timeSlots: true
                    }
                }
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

    static async deleteSchedule(scheduleId: string)
    {
        const res = await prisma.schedule.delete({
            where: { id: scheduleId }
        });
        return res;
    }
}