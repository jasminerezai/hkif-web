import READ  from '../db/readQueries'
import {ApiError} from "../utils/ApiError";
import {Request, Response} from "express";
import {asyncHandler} from "../middleware/asyncHandler";
import CREATE from "../db/createQueries";
import DELETE from "../db/deleteQueries";

const getFavorites = asyncHandler( async (req: Request, res: Response) => {
    const profileId: string = req.user.id;
    const favorites = await READ.activitiesFavoritedBy(profileId)
    if (!favorites || favorites.length === 0){ // successful query, but no results...
        throw ApiError.notFound("You don't have any favorite Activities! :(")
    }
    else if (favorites.length > 0) {
        res.status(200).json(favorites)
    }
    else{ //negative length
        throw ApiError.internal(`Something went Wrong: favorites.length=${favorites.length}\nfavorites-obj:${favorites}`);
    }

});

const newFavorites = asyncHandler( async (req: Request, res: Response) => {
    const profileId: string = req.user.id;
    const activityId: string | undefined = req.params.activityId as string;
    if(!activityId){
        throw ApiError.badRequest("No Activity has been specified");
    }
    else{
        const newFavorite = await CREATE.newFavorite(profileId, activityId);
        if(newFavorite){
            res.status(201).json(newFavorite);
        }
        else{
            throw ApiError.internal(`Something went wrong in the DB: ${newFavorite}`)
        }
    }

})

const deleteFavorites = asyncHandler( async (req: Request, res: Response) => {
    const profileId: string = req.user.id;
    const activityId: string | undefined= req.params.activitId as string;
    if(!activityId){
        throw ApiError.badRequest("No Activity has been specified");
    }
    else{
        const deletedFavorite = await DELETE.deleteFavorite(profileId, activityId);
        if(deletedFavorite){
            res.status(204).json(deletedFavorite); // should we send back the deleted favorite? --> probably already @FE...
        }
        else{
            throw ApiError.internal(`Something went wrong in the DB: ${deletedFavorite}`)
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