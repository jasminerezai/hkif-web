import READ  from '../db/readQueries'
import {ApiError} from "../utils/ApiError";
import {Request, Response} from "express";
import {asyncHandler} from "../middleware/asyncHandler";
// import {ActivityTemplateModel, ProfileModel, FavoriteModel} from '../generated/prisma/models'

const currentWeek = asyncHandler(
    async (_req: Request, res: Response) => {
        console.log("Entered currentWeek()")
        const schedule = await READ.currentSchedule();
        if(schedule){
            res.status(200).json(schedule)
        }
        else{
            // res.send(ApiError.notFound("The Week you are requesting hasn't been scheduled yet!"))
            throw ApiError.notFound("The Week you are requesting hasn't been scheduled yet!")
        }
    }
)

/**
 * generic schedule route handler
 * route: '/api/schedules?date=<someDate>&entireWeek=<boolean>'
 */
const getSchedule = asyncHandler(
    async (req: Request, res: Response) => {
        if(!req.query){
            const thisWeek = await READ.currentSchedule();
            if(thisWeek){
                res.status(200).json(thisWeek);
            } else{
                throw ApiError.notFound("The Week you are requesting hasn't been scheduled yet!")
            }
            return;
        }
        else {
            let schedule;
            let date: Date | string | null = req.query.date as (Date | string | null);
            let entireWeek: string | boolean = req.query.entireWeek as string;

            if (!date || date === "today") {
                date = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
            }
            else {
                if (typeof date === "string"){ // or better check for "YYYY-MM-dd" format?
                    date = new Date(date)
                }
            }

            if (typeof entireWeek === "undefined") {
                entireWeek = true;
            }
            if ( typeof entireWeek === "string"){
                if( entireWeek ===  "true"){
                    entireWeek = true;
                } else{
                    entireWeek = false
                }
            }

            if (entireWeek) {
                schedule = await READ.anyWeekSchedule(date);
                if (!schedule) {
                    throw ApiError.notFound("The Week you are requesting hasn't been scheduled yet!")
                } else {
                    res.status(200).json(schedule);
                    return;
                }
            }
            else {
                schedule = await READ.anyDaySchedule(date);
                if (!schedule) {
                    throw ApiError.notFound("The Day you are requesting hasn't been scheduled yet!")
                } else {
                    res.status(200).json(schedule);
                    return;
                }
            }
        }
    }
)



export const controller = {
    currentWeek,
    getSchedule
}