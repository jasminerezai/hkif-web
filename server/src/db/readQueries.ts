// import './bootstrap.js' // just for the development process
import {prisma} from "./prisma.js";


const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
export default class READ{


    /**
     * consists of two parts: part A) calculates the range of dates, part B) makes the actual query to the DB
     * part A)
     *  - calculates the dates of the start of the week (Monday) and the end of the week (Sunday) from todays date
     *  - has day overflow/underflow protection (when the days in the month go above 28/30/31 or below 1)
     *  - has month overflow/underflow protection (when the month goes below zero or above 11)
     *  - still have to do February 29
     * part B)
     *  - queries DB for the current schedule, includes activities
     *
     *  RETURN:
     *  returns an array of
     *      schedule objects,
     *      including the ActivityTemplate,
     *      ordered by ascending dates (activities on monday come first, those on sunday come last)
     *
     * below an example element of the array
     * {
     *     id: 'a2befa66-576e-46ba-b9af-8b997af84217',
     *     activityId: '40a25eb7-694c-4560-b1c6-b23729b215ec',
     *     startAt: 2026-05-10T15:00:00.711Z,
     *     endAt: null,
     *     status: 'CANCELLED',
     *     createdAt: 2026-05-05T09:51:01.749Z,
     *     updatedAt: 2026-05-05T09:51:01.749Z,
     *     activity: {
     *       id: '40a25eb7-694c-4560-b1c6-b23729b215ec',
     *       name: 'Swimming',
     *       description: 'Swimming session',
     *       location: 'Location 4',
     *       maxCapacity: 16,
     *       defaultStatus: 'ACTIVE',
     *       notes: null,
     *       createdAt: 2026-05-05T09:51:01.596Z,
     *       updatedAt: 2026-05-05T09:51:01.596Z
     *     }
     *   }
     */
    static async currentSchedule(){
        const nowDate: Date = new Date(); // for next weeks query we could just add 7? for the week after +14? usw.

        //put code below in own function
        const weekday: number = nowDate.getUTCDay(); // 0=> sunday; our week starts on Monday, which is 1
        const dayOfMonth: number = nowDate.getUTCDate();
        const monthInYear: number = nowDate.getUTCMonth();
        const year: number = nowDate.getUTCFullYear()

        const mondayBeginning: number = 1;//Number(weekdayMap["MONDAY"]) // returns 1
        const sundayEnd: number = 7; //Number(weekdayMap["SUNDAY"])

        const diffToBeginning: number = weekday - mondayBeginning
        const diffToEnd: number = sundayEnd - weekday;




        let beginMonth: number | undefined;
        let beginYear: number | undefined;
        let beginningOfWeek: number = dayOfMonth - diffToBeginning;
        if(beginningOfWeek <= 0){
            beginMonth = monthInYear-1;
            if(beginMonth < 0){
                beginYear = year -1;
                beginMonth = 11 - Math.abs(beginMonth);
            }
            beginningOfWeek = Math.abs(beginningOfWeek)
            const daysMonth = months[beginMonth]
            if (!daysMonth){
                throw new Error("Something went wrong when calculating the Month, where to check: READ.currentSchedule()");
            }
            beginningOfWeek = daysMonth - beginningOfWeek;
        }
        else{
            beginMonth = monthInYear;
            beginYear = year;
        }


        let endMonth: number | undefined;
        let endYear: number | undefined;
        let endOfWeek: number = dayOfMonth + diffToEnd;
        let daysInAMonth: number = Number(months[monthInYear]);

        if(endOfWeek > daysInAMonth ){
            endMonth = monthInYear+1;
            if(endMonth > 11){
                endYear = year + 1;
                endMonth = Math.abs(endMonth) - 11;
            }
            beginningOfWeek = Math.abs(beginningOfWeek)
            const daysMonth = months[endMonth]
            if (!daysMonth){
                throw new Error("Something went wrong when calculating the Month, where to check: READ.currentSchedule()");
            }
            beginningOfWeek = daysMonth - beginningOfWeek;
        }
        else{
            endMonth = monthInYear;
            endYear = year;
        }


        let startDay: Date | undefined;
        if(beginMonth && beginYear) {
            startDay = new Date(beginYear, beginMonth, beginningOfWeek)
        }

        let endDay: Date | undefined;
        if(endMonth && endYear){
            endDay = new Date(endYear, endMonth, endOfWeek, 23, 59, 59)
        }



        let schedule: object | undefined;
        if(startDay && endDay) {
            schedule = await prisma.schedule.findMany({
                where: {
                    AND: [
                        { startAt: { gte: startDay } },
                        { startAt: { lte: endDay} }
                    ]
                },
                orderBy:{
                    startAt: "asc"
                },
                include: {
                    activity: true
                }
            })
        }
        // console.log(`Start: ${startDay}`)
        // console.log(`Today: ${nowDate}`)
        // console.log(`End: ${endDay}`)
        // console.log(typeof schedule)
        return schedule;
    }
}

async function main(){
    console.log(await READ.currentSchedule());
}
// main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect())