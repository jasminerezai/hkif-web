/**
 * Calculates the start (Monday) and end (Sunday) of the week for a given date.
 * Uses JavaScript's Date object to handle month/year overflow automatically,
 * including leap years.
 */
export function startAndEndOfWeek(nowDate: Date) {
    const weekday = nowDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Calculate diff to Monday (if Sunday, go back 6 days)
    const diffToMonday = weekday === 0 ? -6 : 1 - weekday;
    const diffToSunday = weekday === 0 ? 0 : 7 - weekday;

    const startDay = new Date(nowDate);
    startDay.setUTCDate(nowDate.getUTCDate() + diffToMonday);
    startDay.setUTCHours(0, 0, 0, 0);

    const endDay = new Date(nowDate);
    endDay.setUTCDate(nowDate.getUTCDate() + diffToSunday);
    endDay.setUTCHours(23, 59, 59, 999);

    return { startDay, endDay };
}

// Returns the date N weeks in the future.

export function nextWeek(date: Date, numberOfWeeks: number): Date {
    if (numberOfWeeks === 0) return date;
    const result = new Date(date);
    result.setUTCDate(date.getUTCDate() + Math.abs(Math.trunc(numberOfWeeks)) * 7);
    return result;
}


//Returns the date N weeks in the past.

export function lastWeek(date: Date, numberOfWeeks: number): Date {
    if (numberOfWeeks === 0) return date;
    const result = new Date(date);
    result.setUTCDate(date.getUTCDate() - Math.abs(Math.trunc(numberOfWeeks)) * 7);
    return result;
}


/**
 * Returns the date of the given weekday in the same ISO week as `from`.
 * If `from` is already on that weekday, returns the same day.
 */
export function nextDateForWeekday(from: Date, weekday: string): Date {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const target = days.indexOf(weekday);
    const dow = from.getUTCDay();
    // Monday of from's ISO week
    const weekStart = new Date(from);
    weekStart.setUTCDate(from.getUTCDate() - ((dow + 6) % 7));
    // Add ISO weekday offset (Mon=0 ... Sun=6)
    const isoTarget = (target + 6) % 7;
    weekStart.setUTCDate(weekStart.getUTCDate() + isoTarget);
    return weekStart;
}