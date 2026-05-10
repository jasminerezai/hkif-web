import {ApiError} from "../utils/ApiError";
import {Request, Response} from "express";
import {asyncHandler} from "../middleware/asyncHandler";

import CREATE from "../db/createQueries";
import DELETE from "../db/deleteQueries";
import UPDATE from "../db/updateQueries";

import {parseActivity, postActivity} from '../types/activity.types';
import READ from "../db/readQueries";


/*
    GET /activities --- public, no auth required

    PUT /activities/:id --- leader only
    DELETE /activities/:id --- leader only

    Each activity should include: title, sport, date/time, location, leaderId.
*/

/*
POST /activities --- leader only(auth already happened)
req.body:
{
    "sport": "Volleyball",
    "location": "House 7b - Sportshall",
    "leaderId": "9099c3e4-f386-4a62-bc48-f48c80b31cd0",
    "Weekday": "TUESDAY",
    "startAt": "18:00",
    "endAt": "20:00"
}
 */

const newActivity = asyncHandler(
    async (req: Request, res: Response) => {
        let newActivity: postActivity;
        try{
            newActivity = parseActivity(req.body);
        }
        catch (error){
            throw ApiError.badRequest(`${error}`)
        }
        const result = await CREATE.newActivity(newActivity)
        if(result){
            res.status(201).json(result);
            return;
        }
        else {
            throw ApiError.internal(`Something went wrong:\nYour Request: ${newActivity}\nResult from DB: ${result}`);
        }

    }
)

/**
 * ?property=<someProperty> do I need this?
 *  -> general (non-nested attributes)
 *  -> timeslots
 *  -> leaders
 */
const updateActivity = asyncHandler(
    async (req: Request, res: Response) => {
        const activityId = req.params.id as string;
        const toUpdateProperty: string | undefined = req.query.property as string;
        let updatedActivity;
        if(!toUpdateProperty || !req.query){
            throw ApiError.badRequest("No update Property defined in the URL")
        }
        else{
            try {
                // updatedActivity = await UPDATE.updateActivity(activityId, req.body);
                if(toUpdateProperty==="general"){
                    updatedActivity = await UPDATE.updateActivity(activityId, req.body);
                }
                else if (toUpdateProperty === "timeSlotsAdd"){
                    updatedActivity = await UPDATE.addTimeSlots(activityId, req.body);
                }
                else if (toUpdateProperty === "timeSlotsDel"){
                    updatedActivity = await UPDATE.deleteTimeSlots(activityId, req.body);
                }
                else{
                    updatedActivity = "nothing";
                }
            }
            catch (error) {
                console.error(error)
                throw ApiError.internal(`${error}`)
            }
        }
        res.status(201).json(updatedActivity);
    }
)

const deleteActivity = asyncHandler(
    async (req: Request, res: Response) => {
        const activityId = req.params.id
        if(!activityId || Array.isArray(activityId)){
            throw ApiError.badRequest(`No activity id: ${activityId}`)
        }
        else {
            const deletedActivity = await DELETE.deleteActivity(activityId)
            if(deletedActivity) {
                res.status(200).json(deletedActivity)
            }
            else {
                throw ApiError.internal(`Something went wrong while deleting`)
            }
        }
    }
)

const getActivity = asyncHandler(
    async (_req: Request, res: Response) => {
        const act = await READ.allActivities();
        if(act.length === 0){
            throw ApiError.notFound("No Activities have been registered yet")
        }
        else if (act.length > 0) {
            res.status(200).json(act)
        }
        else{
            throw ApiError.internal(`Something went Wrong in Your Request`)
        }
    }
)

/**
 * 
 */


export const controller = {
    newActivity,
    updateActivity,
    deleteActivity,
    getActivity
}

