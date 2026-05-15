import {READ}  from '../db/readQueries'
import {ApiError} from "../utils/ApiError";
import {Request, Response} from "express";
import {asyncHandler} from "../middleware/asyncHandler";
import {ApiResponse} from "../types";
import {ScheduleDto} from '../types'
import {ScheduleDateSchema, ScheduleBoolWeekSchema} from "../validators/schedule.validator";
import {output, ZodISODate, ZodLiteral, ZodNullable, ZodOptional, ZodUnion} from "zod";

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



export const controller = {
    currentWeek,
    getSchedule
}