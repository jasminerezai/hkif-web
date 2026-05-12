import {ApiError} from "../utils/ApiError";
import {Request, Response} from "express";
import {asyncHandler} from "../middleware/asyncHandler";
import {READ, CREATE, DELETE} from '../db/queries';
import {CreateFavoriteSchema, DeleteFavoriteSchema, isUUID} from "../validators";
import {ApiResponse, FavoriteCreateDelete, ActivityDto} from "../types";

const getFavorites = asyncHandler(
    async (req: Request, res: Response<ApiResponse<ActivityDto[]>>) => {
    const profileId: string = req.user.id;
    if(isUUID(profileId)) {
        const favorites: ActivityDto[] = await READ.activitiesFavoritedBy(profileId)
        if (!favorites || favorites.length === 0) { // successful query, but no results...
            throw ApiError.notFound("You don't have any favorite Activities! :(")
        } else if (favorites.length > 0) {
            res.status(200).json({status: "success", data: favorites})
        } else { //negative length
            throw ApiError.internal(`Something went Wrong: favorites.length=${favorites.length}\nfavorites-obj:${favorites}`);
        }
    } else{
        throw ApiError.badRequest(`The provided User has an invalid id: ${profileId}`);
    }

});

const newFavorites = asyncHandler(
    async (req: Request<{ activityId: string; }>, res: Response<ApiResponse<ActivityDto>>) => {
    let ids: FavoriteCreateDelete | null;
    try{
        ids = CreateFavoriteSchema.parse({profileId: req.user.id, activityId: req.params.activityId})
    } catch(error){
        console.error(error);
        throw ApiError.badRequest(`Invalid ids: ${error}`)
    }

    if(!ids){
        throw ApiError.internal(`Error was not caught by try-catch`)
    }
    else{
        const newFavorite: ActivityDto = await CREATE.newFavorite(ids)
        if(!newFavorite){
            throw ApiError.internal(`Something went wrong in the DB: ${newFavorite}`);
        } else{
            res.status(201).json({status: "success", data: newFavorite});
        }
    }
})

const deleteFavorites = asyncHandler(
    async (req: Request<{ activityId: string; }>, res: Response<ApiResponse<null>>) => {
    let ids: FavoriteCreateDelete | null;
    try{
        ids = DeleteFavoriteSchema.parse({profileId: req.user.id, activityId: req.params.activityId})
    } catch(error){
        console.error(error);
        throw ApiError.badRequest(`Invalid ids: ${error}`)
    }

    if(!ids){
        throw ApiError.internal(`Error was not caught by try-catch`)
    }
    else{
        const deletedFavorite: ActivityDto = await DELETE.deleteFavorite(ids)
        if(!deletedFavorite){
            throw ApiError.internal(`Something went wrong in the DB: ${deletedFavorite}`);
        } else{
            res.status(204).json({status: "success", data: null});
        }
    }
});

export const controller = {
    getFavorites,
    newFavorites,
    deleteFavorites,
}