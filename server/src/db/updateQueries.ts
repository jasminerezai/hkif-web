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
import {timeSloot} from "../types/activity.types";
// import {Weekday} from '../generated/prisma/enums';


export default class UPDATE{

    static async updateActivity(activityId: string, newData: object){
        return prisma.activityTemplate.update({
            where: {id: activityId},
            data: newData
        })
    }

    static async addTimeSlots(activityId: string, newData: timeSloot[]){
        return prisma.activityTemplate.update({
            where: {id: activityId},
            data: {
                timeSlots: {
                    createMany: {
                        data: newData.map( el => ({
                            weekday: el.weekday,
                            startTime: el.startAt,
                            endTime: el.endAt
                        }))
                    }
                }
            },
            include: {
                timeSlots: true
            }
        })
    }

    static async deleteTimeSlots(activityId: string, newData: timeSloot[]){
        return prisma.activityTemplate.update({
            where: {id: activityId},
            data: {
                timeSlots: {
                    deleteMany: {
                        OR: newData.map( el => ({
                            weekday: el.weekday,
                            startTime: el.startAt,
                            endTime: el.endAt
                        }))
                    }
                }
            },
            include: {
                timeSlots: true
            }
        })
    }

    /*static async updateTimeSlot(activityId: string, weekday: Weekday, newData: object){
        return prisma.timeSlot.update({
            where: {
                AND: [
                    {activityId},
                    {weekday}
                ]
            },
            data: newData
        })
    }*/

}