const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/**
 * - calculates the dates of the start of the week (Monday) and the end of the week (Sunday) from todays date
 *  - has day overflow/underflow protection (when the days in the month go above 28/30/31 or below 1)
 *  - has month overflow/underflow protection (when the month goes below zero or above 11)
 *  - still have to do February 29
 * @param nowDate:Date any date, variable names stems from READ.currentSchedule()
 */
export function startAndEndOfWeek(nowDate: Date){
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

    return {
        startDay,
        endDay
    }
}