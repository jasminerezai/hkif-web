import READ  from '../db/readQueries'
import {ApiError} from "../utils/ApiError";
import {Request, Response} from "express";
import {asyncHandler} from "../middleware/asyncHandler";
import CREATE from "../db/createQueries";
import DELETE from "../db/deleteQueries";

const getFavorites = asyncHandler( async (req: Request, res: Response) => {
    const profileId: string | undefined = req.user?.id;

    if(!profileId){
        throw ApiError.unauthorized("Please Log In! (For debug: Somehow passed protect & restrictedTo)")
        //or redirect to login page?
    }
    else{
        const favorites = await READ.activitiesFavoritedBy(profileId)
        if (!favorites || favorites.length === 0){ // successful query, but no results...
            throw ApiError.notFound("You don't have any favorite Activities! :(")
        }
        else if (favorites.length > 0) {
            res.status(200).json(favorites)
        }
        else{
            throw ApiError.internal(`Something went Wrong: favorites.length=${favorites.length}\nfavorites-obj:${favorites}`);
        }
    }

});

const newFavorites = asyncHandler( async (req: Request, res: Response) => {
    const profileId: string | undefined = req.user?.id;
    const activityIds: string[] | undefined= req.body.activityIds

    if(!profileId){
        throw ApiError.unauthorized("Please Log In! (For debug: Somehow passed protect & restrictedTo)")
        //or redirect to login page?
    }
    if(!activityIds){
        throw ApiError.badRequest("Please Specify At least one Activity")
    }

    else{
        const newFavorites = await CREATE.addFavorites(profileId, ...activityIds)
        if(!newFavorites){
            throw ApiError.badRequest("Please Specify At least one Activity")
        }
        else if(newFavorites.length === 0){
            throw ApiError.badRequest("Please Make Sure You haven't already added the activities")
        }
        else{
            res.status(201).json(newFavorites);
        }
    }
})

const deleteFavorites = asyncHandler( async (req: Request, res: Response) => {
    const profileId: string | undefined = req.user?.id;
    const activityIds: string[] | undefined= req.body.activityIds

    if(!profileId){
        throw ApiError.unauthorized("Please Log In! (For debug: Somehow passed protect & restrictedTo)")
        //or redirect to login page?
    }
    if(!activityIds){
        throw ApiError.badRequest("Please Specify At least one Activity")
    }

    else{
        const deletedCount = await DELETE.deleteFavorites(profileId, ...activityIds)
        if(!deletedCount){
            throw ApiError.badRequest("Please Specify At least one Activity")
        }
        else if(deletedCount.count < activityIds.length){
            throw ApiError.internal(`Something went wrong:\nYou sent ${activityIds.length} Activities, but we could only delete ${deletedCount.count}\n\nSent Activities: ${activityIds}\nBatchPayload: ${deletedCount}`)
        }
        else{
            res.status(200).json(deletedCount);
        }
    }
});

// const checkProfileId = (profileId: string |undefined) => {
//     const profileId: string | undefined = req.user?.id;
//
//     if(!profileId){
//         throw ApiError.unauthorized("Please Log In! (For debug: Somehow passed protect & restrictedTo)")
//         //or redirect to login page?
//     }
// }

export const controller = {
    getFavorites,
    newFavorites,
    deleteFavorites,
}