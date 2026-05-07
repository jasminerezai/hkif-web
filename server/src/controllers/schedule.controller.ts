import READ  from '../db/readQueries'
import {ApiError} from "../utils/ApiError";
import {Request, Response} from "express";
import {asyncHandler} from "../middleware/asyncHandler";
// import {ActivityTemplateModel, ProfileModel, FavoriteModel} from '../generated/prisma/models'

const currentWeek = asyncHandler(
    async (_req: Request, res: Response) => {
        const schedule = await READ.currentSchedule();
        if(schedule){
            res.status(200).json(schedule)
        } else{
            // res.send(ApiError.notFound("The Week you are requesting hasn't been scheduled yet!"))
            throw ApiError.notFound("The Week you are requesting hasn't been scheduled yet!")
        }
    }
)




export const controller = {
    currentWeek,
}