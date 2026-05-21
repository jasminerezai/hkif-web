import {ActivityDto, ScheduleDto} from "../types/index.js";

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
    let {leaders, ...rest} = activity.leaders ?? [];
    leaders = Array.isArray(leaders) ? leaders.map((el: { profile: { id: string; profileName: string | null } }) => el.profile) : [];
    // (activity as any).leaders = undefined;
    return {
        ...rest,
        leaders
    } satisfies ActivityDto
}
