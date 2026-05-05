import READ  from '../db/readQueries.js'
import {ApiError} from "../utils/ApiError.js";

async function currentWeek(req, res) {
    const schedule = await READ.currentSchedule();
    if(schedule){
       res.status(200).json(schedule)
    } else{
        res.send(ApiError.notFound("The Week you are requesting hasn't been scheduled yet!"))
    }
}



export const controller = {
    currentWeek
}