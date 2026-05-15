/**
 * Reggex:
 * // Source - https://stackoverflow.com/a/43039051
 * // Posted by phatfingers
 * // Retrieved 2026-05-08, License - CC BY-SA 3.0
 *
 * /^([01][0-9]|2[0-3]):([0-5][0-9])$/
 * @param timestamp of hours and minutes
 * @return if the timestamp matches the reggex: HH:MM
 */
const timeReg: RegExp = /^1970-01-01T([01][0-9]|2[0-3]):([0-5][0-9]):00\+01:00$/

export function regTime(timestamp: string): boolean {
    return timeReg.test(timestamp);
}