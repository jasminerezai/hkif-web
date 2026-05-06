import READ  from '../db/readQueries'
import {ApiError} from "../utils/ApiError";
// import {asyncHandler} from "../middleware/asyncHandler";

async function currentWeek(req, res) {
    const schedule = await READ.currentSchedule();
    if(schedule){
       res.status(200).json(schedule)
    } else{
        // res.send(ApiError.notFound("The Week you are requesting hasn't been scheduled yet!"))
        throw ApiError.notFound("The Week you are requesting hasn't been scheduled yet!")
    }
}



export const controller = {
    currentWeek
}