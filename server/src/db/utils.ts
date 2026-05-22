import {ActivityDto, leaderDto, ScheduleDto} from "../types/index.js";

/**
 * Shared utility to format a raw schedule from Prisma, extracting and flattening 
 * leaders from `activity.leaders` and cleaning up the original nested leaders property.
 */
export function formatSchedule(schedule: any): ScheduleDto {
    const leadersRaw = schedule.activity.leaders ?? [];
    const leaders = Array.isArray(leadersRaw)
        ? leadersRaw.map((el: { profile: any }) => el.profile)
        : [];

    const activity = { ...schedule.activity };
    delete activity.leaders;

    return {
        id: schedule.id,
        activityId: schedule.activityId,
        startAt: schedule.startAt,
        endAt: schedule.endAt,
        status: schedule.status,
        createdAt: schedule.createdAt,
        updatedAt: schedule.updatedAt,
        activity,
        leaders
    } satisfies ScheduleDto;
}

export function formatActivity(activity: any): ActivityDto {
    let leadersRaw = activity.leaders ?? [];
    const leaders: leaderDto[] = Array.isArray(leadersRaw)
        ? leadersRaw.map((el: { profile: { profileId: string; profileName: string | null } }) => el.profile)
        : [];
    const restOfActivity = {...activity}
    delete restOfActivity.leaders;
    return {
        leaders: leaders,
        timeSlots: restOfActivity.timeSlot,
        name: restOfActivity.name,
        location: restOfActivity.location,
        description: restOfActivity.description,
        maxCapacity: restOfActivity.maxCapacity,
        defaultStatus: restOfActivity.defaultStatus,
        notes: restOfActivity.notes
    } satisfies ActivityDto
}
