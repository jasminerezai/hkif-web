import {READ}  from '../db/readQueries'
import {ApiError} from "../utils/ApiError";
import {Request, Response} from "express";
import {asyncHandler} from "../middleware/asyncHandler";
import {ApiResponse} from "../types";
import { ScheduleDto } from '../types/schedule.types';

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
        if(!req.query){
            const thisWeek: ScheduleDto[] = await READ.currentSchedule();
            res.status(200).json({status: "success", data: thisWeek});
            return;
        }
        else {
            let schedule: ScheduleDto[];
            let date: string | Date | null = req.query.date as (Date | string | null);
            let entireWeek: string | boolean = req.query.entireWeek as string;

            if (!date || date === "today") {
                date = new Date();
            }
            else {
                if (typeof date === "string"){ // or better check for "YYYY-MM-dd" format?
                    date = new Date(date)
                }
            }
            date.setUTCHours(0, 0, 0);

            if (typeof entireWeek === "undefined") {
                entireWeek = true;
            }
            if ( typeof entireWeek === "string"){
                entireWeek = entireWeek === "true";
            }

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
    }
)



export const controller = {
    currentWeek,
    getSchedule
}