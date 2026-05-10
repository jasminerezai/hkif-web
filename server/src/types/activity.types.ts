import {Weekday, ActivityStatus} from '../db/prisma';
import {regTime} from "../utils/reggex";
// import { Weekday } from "@prisma/client"
/*{
    "name": "Volleyball",
    "location": "House 7b - Sportshall",
    "leaderId": "9099c3e4-f386-4a62-bc48-f48c80b31cd0",
    "Weekday": "TUESDAY",
    "startAt": "18:00",
    "endAt": "20:00"
}*/
// export type postActivity  = {
//     name: string,
//     location: string,
//     leaders: string[],
//     weekday: Weekday,
//     startAt: string,
//     endAt: string,
//     description?: string,
//     notes?: string,
//     defaultStatus?: ActivityStatus
// }
/*export type postActivity = {
    name: string,
    location: string,
    leaders: string[],
    description?: string,
    notes?: string,
    defaultStatus?: ActivityStatus,
    timeSlots: timeSloot[]
}*/
export type postActivity = {
    name?: string,
    location?: string,
    leaders?: string[],
    description?: string,
    notes?: string,
    defaultStatus?: ActivityStatus,
    timeSlots?: timeSlot[]
}
export type timeSlot = {
    weekday: Weekday, startAt?: string | Date, endAt?: string | Date
}
function assertTimeSloot(obj: unknown): asserts obj is timeSlot
{
    if (typeof obj !== "object" || obj === null) {
        throw new Error("Not an object");
    }

    const data = obj as any

    if (data.startAt === undefined && data.endAt === undefined && data.weekday === undefined) {
        // throw new Error(`Must have at least one timestamp of the pattern: 1970-01-01THH:MM:00+01:00\nObject: ${Object.entries(obj)}`)
        throw new Error(`Data must have some data!`)
    }
    if(!data.startAt && !data.endAt && !data.weekday){
        throw new Error(`Data must have some data!`)
    }
    if (data.startAt !== undefined) {
        if ( !(typeof data.startAt === "string") ) {
            throw new Error(`Starting Timestamp not a string: ${data.startAt}\nObject: ${Object.entries(obj)}`)
        }
        if( !regTime(data.startAt) ){
            throw new Error(`Invalid Starting Timestamp: ${data.startAt}\nMust follow this pattern: 1970-01-01THH:MM:00+01:00\nObject: ${Object.entries(obj)}`)
        } else{
            data.startAt = new Date(data.startAt);
        }
    }
    if (data.endAt !== undefined) { // data.endAt !== undefined
        if ( !(typeof data.endAt === "string") ) {
            throw new Error(`Ending Timestamp is not a string: ${data.endAt}\nMust follow this pattern: 1970-01-01THH:MM:00+01:00\nObject: ${Object.entries(obj)}`)
        }
        if( !regTime(data.endAt)){
            throw new Error(`Invalid Ending Timestamp: ${data.endAt}\nMust follow this pattern: 1970-01-01THH:MM:00+01:00\nObject: ${Object.entries(obj)}`)
        } else{
            data.endAt = new Date(data.endAt);
        }
    }
    if( !(typeof data.weekday === "string" && Object.values(Weekday).includes(data.weekday)) ){
        throw new Error(`Invalid Weekday: ${data.weekday}\nObject: ${Object.entries(obj)}`)
    }
}


/**
 * asserts that the obj is of at least type postActivity (it can have more properties than postActivty)
 * @param obj
 */
/*export function assertPostActivity(obj: unknown): asserts obj is postActivity
{
    //Object & existence check
    if (typeof obj !== "object" || obj === null) {
        throw new Error("Not an object")
    }

    const data = obj as any

    // property existience check (only allows for the properties in postActivity & no extra)
    // const allowedKeys: (keyof postActivity)[] = [
    //     "name",
    //     "location",
    //     "leaderId",
    //     "weekday",
    //     "startAt",
    //     "endAt",
    // ]

    // property type check
    // if(!(
    //     typeof data?.name === "string" &&
    //     typeof data?.location === "string" &&
    //     (typeof data?.leaderId === "string" ||
    //         (Array.isArray(data?.leaderId)) && data.leaderId.every( (id: any) => typeof id === "string")) &&
    //     typeof data?.weekday === "string" &&
    //     typeof data?.startAt === "string" &&
    //     typeof data?.endAt === "string"
    // )){
    //     throw new Error("Invalid Property Types")
    // }

    if (typeof data.name !== "string") {
        throw new Error("Invalid name")
    }

    if (typeof data.location !== "string") {
        throw new Error("Invalid location")
    }

    if ( !(Array.isArray(data.leaderId) &&  data.leaders.every( (id: any) => typeof id === "string")) ) {
        throw new Error(`Invalid leaderId ${data.leaders}`)
    }

    if (typeof data.startAt !== "string") {
        throw new Error("Invalid startAt")
    }

    if (typeof data.endAt !== "string") {
        throw new Error("Invalid endAt")
    }
    if(typeof data.weekday !== "string"){
        throw new Error(`Invalid Weekday: ${typeof data.weekday}`)
    }

    //special property type checks
    if (!Object.values(Weekday).includes(data.weekday)) {
        throw new Error(`Invalid weekday ${data.weekday};\nGood Values: ${Object.values(Weekday)}`)
    }
    if(!regTime(data?.startAt) || !regTime(data?.endAt)){
        throw new Error(`Invalid Time Properties: \ns:${data.startAt}\ne:${data.endAt}`)
    }

    //optional property type checks:
    if(data.description){
        if(! (typeof data.description === "string")){
            throw new Error("Invalid Property Types")
        }
    }

    if(data.notes){
        if(! (typeof data.notes === "string")){
            throw new Error(`Invalid Property Type of ${data.notes}`)
        }
    }
    if(data.defaultStatus){
        if(! (typeof data.defaultStatus === "string")){
            throw new Error(`Invalid Property Type of ${data.defaultStatus}`)
        }
        if( ! Object.values(ActivityStatus).includes(data.defaultStatus)){
            throw new Error("Invalid Activity Status")
        }
    }
}*/
export function assertPostActivity(obj: unknown): asserts obj is postActivity
{
    //Object & existence check
    if (typeof obj !== "object" || obj === null) {
        throw new Error("Not an object")
    }

    const data = obj as any

    // property type check
    if (typeof data.name !== "string") {
        throw new Error(`Invalid name: ${data.name}`)
    }

    if (typeof data.location !== "string") {
        throw new Error(`Invalid location: ${data.location}`)
    }

    if (!(Array.isArray(data.leaders) && data.leaders.every((id: any) => typeof id === "string"))) {
        throw new Error(`Invalid leaders: ${data.leaders}`)
    }

    if (!(Array.isArray(data.timeSlots)) ) {
        throw new Error(`Invalid timeSlots: ${data.timeSlots}`);
    }
    console.log(data.timeSlots)
    data.timeSlots.forEach( (time: any) => {
        try {
            assertTimeSloot(time)
        } catch (e){
            // throw new Error(`Invalid TimeSlot: ${time}\n ${e}`)
            console.error(e)
        } finally{
            // console.log(time)
            console.log("Finally")
        }
    } )

    /*for (let i = 0; i < data.timeSlots.length; i++) {
        const slot = data.timeSlots[i]
        if (typeof slot !== "object" || slot === null) {
            throw new Error(`Invalid timeSlot at index ${i}: ${slot}`)
        }
        if (typeof slot.weekday !== "string") {
            throw new Error(`Invalid timeSlot[${i}].weekday: ${slot.weekday}`)
        }
        if (!Object.values(Weekday).includes(slot.weekday)) {
            throw new Error(`Invalid timeSlot[${i}].weekday ${slot.weekday}; Good Values: ${Object.values(Weekday)}`)
        }
        if (typeof slot.startAt !== "string") {
            throw new Error(`Invalid timeSlot[${i}].startAt: ${slot.startAt}`)
        }
        if (typeof slot.endAt !== "string") {
            throw new Error(`Invalid timeSlot[${i}].endAt: ${slot.endAt}`)
        }
        if (!regTime(slot.startAt) || !regTime(slot.endAt)) {
            throw new Error(`Invalid timeSlot[${i}] time properties: startAt=${slot.startAt}, endAt=${slot.endAt}\nObj: ${slot}`)
        }
    }*/

    //optional property type checks:
    if(data.description !== undefined){
        if(! (typeof data.description === "string")){
            throw new Error(`Invalid description: ${data.description}`)
        }
    }

    if(data.notes !== undefined){
        if(! (typeof data.notes === "string")){
            throw new Error(`Invalid notes: ${data.notes}`)
        }
    }
    if(data.defaultStatus !== undefined){
        if(! (typeof data.defaultStatus === "string")){
            throw new Error(`Invalid defaultStatus: ${data.defaultStatus}`)
        }
        if( ! Object.values(ActivityStatus).includes(data.defaultStatus)){
            throw new Error(`Invalid defaultStatus ${data.defaultStatus}; Good Values: ${Object.values(ActivityStatus)}`)
        }
    }
}

export function parseActivity(obj: any): postActivity {
    assertPostActivity(obj)
    return obj;
    // const {
    //     name,
    //     location,
    //     leaderId,
    //     weekday,
    //     startAt,
    //     endAt,
    //     description,
    //     notes,
    //     defaultStatus
    // } = obj
    //
    //
    // return {
    //     name,
    //     location,
    //     leaderId,
    //     weekday,
    //     startAt,
    //     endAt,
    //     description,
    //     notes,
    //     defaultStatus
    // } satisfies postActivity
}
// return {
//     name: obj.name,
//     location: obj.location,
//     leaderId: obj.leaderId,
//     weekday: obj.weekday,
//     startAt: obj.startAt,
//     endAt: obj.endAt,
// };


const testAct = {
    name: "Volleyball",
    location: "Sportshall",
    leaders: ["Kavish", "Juri"],
    description: "Often 3-4 teams of 6 players.",
    notes: "Almost always goes longer than scheduled",
    defaultStatus : ActivityStatus.ACTIVE,
    timeSlots: [
        {weekday: Weekday.SUNDAY, startAt: "1970-01-01T16:00:00+01:00", endAt: "1970-01-01T20:00:00+01:00"},
        {weekday: Weekday.TUESDAY, startAt: "1970-01-01T18:00:00+01:00", endAt: "1970-01-01T20:00:00+01:00"},
        // {} //, startAt: "1970-01-01T18:00:00+01:00" //weekday: Weekday.THURSDAY, startAt: undefined, endAt: undefined
        // "Not an OBJECT"
    ]
}

try{
    assertPostActivity(testAct);
    // testAct.timeSlots.every( (timeSlot) => {
    //     assertTimeSloot(timeSlot);
    // });
}
catch (e){
    console.error(e)
}
finally{
    // console.log(testAct)
}
