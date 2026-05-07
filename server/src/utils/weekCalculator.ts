const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const JANUARY: number = 0
const DECEMBER: number = 11

/**
 * - calculates the dates of the start of the week (Monday) and the end of the week (Sunday) from todays date
 *  - has day overflow/underflow protection (when the days in the month go above 28/30/31 or below 1)
 *  - has month overflow/underflow protection (when the month goes below zero or above 11)
 *  - still have to do February 29
 * @param nowDate
 *      any date, variable names stems from READ.currentSchedule()
 */
export function startAndEndOfWeek(nowDate: Date){
    const weekday: number = nowDate.getUTCDay(); // 0=> sunday; our week starts on Monday, which is 1
    const dayOfMonth: number = nowDate.getUTCDate();
    const monthInYear: number = nowDate.getUTCMonth(); // 0-> Jan & 11 -> Dec
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
        if(beginMonth < JANUARY){
            beginYear = year - 1 ;
            beginMonth = DECEMBER - Math.abs(beginMonth);
        }

        beginningOfWeek = Math.abs(beginningOfWeek)
        const daysMonth = Number(months[beginMonth]);
        // if (!daysMonth){
        //     throw new Error("Something went wrong when calculating the Month, where to check: READ.currentSchedule()");
        // }
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
        if(endMonth > DECEMBER){ //11 is december, change as local constant?
            endYear = year + 1;
            endMonth = Math.abs(endMonth) - DECEMBER;
        }
        // endOfWeek = Math.abs(endOfWeek)
        const daysMonth = months[endMonth]
        if (!daysMonth){
            throw new Error("Something went wrong when calculating the Month, check use cases");
        }
        endOfWeek -= daysMonth;
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

/**
 *
 * @param date start-date
 * @param numberOfWeeks number of weeks you want the future date to be; if 0 the parameter date is returned
 *  --> converted into a positive integer that represent the number of weeks in days
 */
export function nextWeek(date: Date, numberOfWeeks: number): Date
{
    if(numberOfWeeks === 0){
        return date;
    }
    //parameter is converted into a positive integer and then multiplied by seven to get the number of days
    let weeksInDays = Math.abs(parseInt(String(numberOfWeeks))) * 7;
    let dayInMonth: number = date.getUTCDate();
    let monthInYear: number = date.getUTCMonth();
    let year: number = date.getUTCFullYear();

    let daysInTheMonth = Number(months[monthInYear]);

    dayInMonth += weeksInDays;

    if(dayInMonth > daysInTheMonth){
        monthInYear++;
        if(monthInYear > DECEMBER){
            year++;
            monthInYear -= DECEMBER;
        }
        daysInTheMonth = Number(months[monthInYear]);
        dayInMonth -= daysInTheMonth;
    }

    return new Date(Date.UTC(year, monthInYear, dayInMonth));
}


/**
 *
 * @param date start-date
 * @param numberOfWeeks number of weeks you want the past date to be; if 0 the parameter date is returned
 *  --> converted into a negative integer that represent the number of weeks in days
 */
export function lastWeek(date: Date, numberOfWeeks: number): Date
{
    if(numberOfWeeks === 0){
        return date;
    }
    //parameter is converted into a positive integer and then multiplied by seven to get the number of days
    let weeksInDays = parseInt(String(numberOfWeeks)) * 7;
    if(weeksInDays > 0){
        weeksInDays *= -1;
    }
    let dayInMonth: number = date.getUTCDate();
    let monthInYear: number = date.getUTCMonth();
    let year: number = date.getUTCFullYear();

    let daysInTheMonth = Number(months[monthInYear]);

    dayInMonth += weeksInDays;

    if(dayInMonth < 0){
        monthInYear--;
        if(monthInYear < JANUARY){
            year--;
            monthInYear = DECEMBER - Math.abs(monthInYear);
        }
        daysInTheMonth = Number(months[monthInYear]);
        dayInMonth = daysInTheMonth - Math.abs(dayInMonth);
    }

    return new Date(Date.UTC(year, monthInYear, dayInMonth));
}