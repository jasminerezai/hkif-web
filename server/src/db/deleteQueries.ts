/*
DELETE Queries
    remove time slot of an activity
    delete activity --> note cascade effect
    delete profile --> note cascade effect
    delete participation logs older than 6 months
 */
import {prisma} from "./prisma";
import {BatchPayload} from '../generated/prisma/internal/prismaNamespace'

export default class DELETE{

    // static async deleteFavorites(profileId: string, ...activityIds: string[]){
    //     const deletedCount = await prisma.favorite.deleteMany({
    //         where: {
    //             AND: [
    //                 { profileId },
    //                 { activityId: ...activityIds}
    //             ]
    //         }
    //     })
    // }
    // static async deleteFavorites(profileId: string, ...activityIds: string[]){
    //     await prisma.profile.update({
    //         where: {id: profileId},
    //         data: {
    //             favorites: {
    //                 deleteMany: {
    //                     activityId: {
    //                         in: activityIds
    //                     }
    //                 }
    //             }
    //         }
    //     })
    // }
    static async deleteFavorites(profileId: string, ...activityIds: string[]): Promise< BatchPayload>
    {
        const deleteCount = await prisma.favorite.deleteMany({
            where:{
                profileId,
                activityId: {
                    in: activityIds
                }
            }
        });
        return deleteCount; // deleteCount.count === activityIds
    }
}