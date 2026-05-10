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
import {timeSlot} from "../types/activity.types";
import {Weekday} from '../generated/prisma/enums';


export default class UPDATE{

    static async updateActivity(activityId: string, newData: object){
        return prisma.activityTemplate.update({
            where: {id: activityId},
            data: newData
        })
    }

    static async addTimeSlots(activityId: string, newData: timeSlot[]){
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

    static async deleteTimeSlots(activityId: string, newData: timeSlot[]){
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

    static async updateTimeSlot(activityId: string, timeSlot: timeSlot, newData: object){//timeSlot: timeSloot,
        if(timeSlot.startAt !== undefined) {
            return prisma.timeSlot.update({
                where: {
                    activityId_weekday_startTime: {
                        activityId,
                        weekday: timeSlot.weekday,
                        startTime: timeSlot.startAt
                        // {startTime: timeSlot.startAt}
                    }
                },
                data: newData
            })
        }
        else{
            throw new Error(`timeslot starting time is undefined. timeSlot: ${timeSlot}`)
        }
    }



}

// ACTIVITY UPDATES
const activityGeneralUpdateQuery = (activityId: string, data: object) => {
    return {
        where: {
            id: activityId
        },
        data
    }
}

const activityTimeAddQuery = () => {}
const activityTimeDeleteQuery = () => {}
const activityTimeUpdateQuery = () => {}

const activityLeaderAddQuery = () => {}
const activityLeaderDeleteQuery = () => {}