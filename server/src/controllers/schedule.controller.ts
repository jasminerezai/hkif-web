import {READ}  from '../db/readQueries.js';
import {ApiError} from "../utils/ApiError.js";
import {Request, Response} from "express";
import {asyncHandler} from "../middleware/asyncHandler.js";
import {ApiResponse} from "../types/index.js";
import {ScheduleDto} from '../types/index.js';
import {ScheduleDateSchema, ScheduleBoolWeekSchema} from "../validators/schedule.validator.js";
import {output, ZodISODate, ZodLiteral, ZodNullable, ZodOptional, ZodUnion} from "zod";
import { CREATE, UPDATE, DELETE } from "../db/queries.js";
import { prisma, ProfileRole } from "../db/prisma.js";
import { CreateScheduleSchema, UpdateScheduleSchema, ScheduleIdParamSchema } from "../validators/index.js";

// Helper to assert activity existence & ownership for LEADERs
async function assertActivityAccess(
    activityId: string,
    requesterId: string,
    role: ProfileRole,
) {
    const activity = await prisma.activityTemplate.findUnique({
        where: { id: activityId },
        select: { id: true, name: true },
    });

    if (!activity) {
        throw ApiError.notFound('Activity not found');
    }

    if (role === ProfileRole.LEADER) {
        const ownership = await prisma.leaderActivity.findUnique({
            where: {
                profileId_activityId: { profileId: requesterId, activityId },
            },
        });

        if (!ownership) {
            throw ApiError.forbidden('You are not the leader of this activity');
        }
    }

    return activity;
}

const currentWeek = asyncHandler(
    async (_req: Request, res: Response< ApiResponse< ScheduleDto[] > >) => {
        const schedule: ScheduleDto[] = await READ.currentSchedule();
        res.status(200).json({status: "success", data: schedule})
    }
)

/**
 * generic schedule route handler
 * route: '/api/schedules?date=<someDate>&entireWeek=<boolean>'
 */
const getSchedule = asyncHandler(
    async (req: Request, res: Response< ApiResponse< ScheduleDto[] > >) => {
        let schedule: ScheduleDto[];// ScheduleDto[]
        let date: output<ZodOptional<ZodNullable<ZodUnion<readonly [ZodISODate, ZodLiteral<"today">]>>>> | Date;
        let entireWeek: boolean | null;
        const resultDate = ScheduleDateSchema.safeParse(req.query.date);
        const resultBool = ScheduleBoolWeekSchema.safeParse(req.query.entireWeek);
        if(!resultDate.success) throw ApiError.badRequest(`Invalid Query Values: Bad date ${req.query.date}`);
        else { date = resultDate.data}

        if(!resultBool.success) throw ApiError.badRequest(`Invalid Query Values: Bad Boolean ${req.query.entireWeek}`);
        else{ entireWeek = resultBool.data}


        if (!date || date === "today") {
            date = new Date();
            date = date as Date;
        } else{
            date = new Date(date);
        }
        date.setUTCHours(0, 0, 0, 0);
        if( typeof entireWeek === "undefined"){ entireWeek = true}
        if (entireWeek) {
            schedule = await READ.anyWeekSchedule(date);
            res.status(200).json({status: "success", data: schedule});
            return;
        }
        else {
            schedule = await READ.anyDaySchedule(date) ?? [];
            res.status(200).json({status: "success", data: schedule});
            return;
        }
    }
)

const createSchedule = asyncHandler(async (
    req: Request<{}, any, { activityId: string; startAt: string; endAt?: string | null; status?: string }>,
    res: Response<ApiResponse<ScheduleDto>>
) => {
    let parsed;
    try {
        parsed = CreateScheduleSchema.parse(req.body);
    } catch (err) {
        throw ApiError.badRequest(`Invalid request body: ${err}`);
    }

    const { activityId, startAt, endAt, status } = parsed;

    const activity = await prisma.activityTemplate.findUnique({
        where: { id: activityId },
        select: { id: true, defaultStatus: true }
    });

    if (!activity) {
        throw ApiError.notFound('Activity not found');
    }

    const finalStatus = status || activity.defaultStatus;

    const newSchedule = await CREATE.newSchedule({
        activityId,
        startAt,
        endAt,
        status: finalStatus
    });

    res.status(201).json({
        status: 'success',
        data: newSchedule
    });
});

const updateSchedule = asyncHandler(async (
    req: Request<{ scheduleId: string }, any, { startAt?: string; endAt?: string | null; status?: string }>,
    res: Response<ApiResponse<ScheduleDto>>
) => {
    let parsedParams;
    let parsedBody;
    try {
        parsedParams = ScheduleIdParamSchema.parse(req.params);
        parsedBody = UpdateScheduleSchema.parse(req.body);
    } catch (err) {
        throw ApiError.badRequest(`Invalid parameters or request body: ${err}`);
    }

    const { scheduleId } = parsedParams;
    const { id: requesterId, role } = req.user!;

    const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
        select: { id: true, activityId: true }
    });

    if (!schedule) {
        throw ApiError.notFound('Schedule not found');
    }

    await assertActivityAccess(schedule.activityId, requesterId, role);

    const updated = await UPDATE.updateSchedule(scheduleId, parsedBody);

    res.status(200).json({
        status: 'success',
        data: updated
    });
});

const deleteSchedule = asyncHandler(async (
    req: Request<{ scheduleId: string }>,
    res: Response<ApiResponse<null>>
) => {
    let parsedParams;
    try {
        parsedParams = ScheduleIdParamSchema.parse(req.params);
    } catch (err) {
        throw ApiError.badRequest(`Invalid parameters: ${err}`);
    }

    const { scheduleId } = parsedParams;

    const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
        select: { id: true }
    });

    if (!schedule) {
        throw ApiError.notFound('Schedule not found');
    }

    await DELETE.deleteSchedule(scheduleId);

    res.status(200).json({
        status: 'success',
        data: null
    });
});

export const controller = {
    currentWeek,
    getSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule
}