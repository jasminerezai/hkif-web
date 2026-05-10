/*
UPDATE Queries
    update activity status in schedule
    profile updates
        add favorites
        remove favorites
        promote profile
    change time slot of an activity
 */
import {prisma} from "./prisma";


export default class UPDATE{

    static async updateActivity(activityId: string, newData: object){
        return prisma.activityTemplate.update({
            where: {id: activityId},
            data: newData
        })
    }

}