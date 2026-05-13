import {ApiError} from "../utils/ApiError";
import {Request, Response} from "express";
import {asyncHandler} from "../middleware/asyncHandler";
import {READ, CREATE, DELETE} from '../db/queries';
import {CreateFavoriteSchema, DeleteFavoriteSchema} from "../validators";
import {ApiResponse, FavoriteCreateDelete, ActivityDto} from "../types";

const getFavorites = asyncHandler(
    async (req: Request, res: Response<ApiResponse<ActivityDto[]>>) => {
    const profileId: string = req.user.id;
    const favorites: ActivityDto[] = await READ.activitiesFavoritedBy(profileId);
    res.status(200).json({status: "success", data: favorites});
});

const newFavorites = asyncHandler(
    async (req: Request<{ activityId: string; }>, res: Response<ApiResponse<ActivityDto>>) => {
    let ids: FavoriteCreateDelete;
    try{
        ids = CreateFavoriteSchema.parse({profileId: req.user.id, activityId: req.params.activityId})
    } catch(error){
        throw ApiError.badRequest(`Invalid ids: ${error}`)
    }
        const newFavorite: ActivityDto = await CREATE.newFavorite(ids);
        if(!newFavorite) throw ApiError.internal(`Something went wrong in the DB: ${newFavorite}`);
        res.status(201).json({status: "success", data: newFavorite});
})

const deleteFavorites = asyncHandler(
    async (req: Request<{ activityId: string; }>, res: Response<ApiResponse<null>>) => {
    let ids: FavoriteCreateDelete | null;
    try{
        ids = DeleteFavoriteSchema.parse({profileId: req.user.id, activityId: req.params.activityId})
    } catch(error){
        throw ApiError.badRequest(`Invalid ids: ${error}`)
    }
    const deletedFavorite: ActivityDto = await DELETE.deleteFavorite(ids);
    if(!deletedFavorite) throw ApiError.internal(`Something went wrong in the DB: ${deletedFavorite}`);
    res.status(200).json({status: "success", data: null});
});

export const controller = {
    getFavorites,
    newFavorites,
    deleteFavorites,
}