import {ApiError} from "../utils/ApiError.js";
import {Request, Response} from "express";
import {asyncHandler} from "../middleware/asyncHandler.js";
import {READ, CREATE, DELETE} from '../db/queries.js';
import { CreateFavoriteSchema, DeleteFavoriteSchema } from "../validators/index.js";
import { ApiResponse, FavoriteCreateDelete, ActivityDto, ProfileDto } from "../types/index.js";
import { IdSchema } from "../validators/profile.validator.js";

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
    async (req: Request<{ activityId: string; }>, res: Response<ApiResponse<ActivityDto>>) => {
    let ids: FavoriteCreateDelete | null;
    try{
        ids = DeleteFavoriteSchema.parse({profileId: req.user.id, activityId: req.params.activityId})
    } catch(error){
        throw ApiError.badRequest(`Invalid ids: ${error}`)
    }
    const deletedFavorite: ActivityDto = await DELETE.deleteFavorite(ids);
    if(!deletedFavorite) throw ApiError.internal(`Something went wrong in the DB: ${deletedFavorite}`);
    res.status(204).send()
});

const getFullProfile = asyncHandler(
    async (req: Request, res: Response<ApiResponse<ProfileDto> > ) => {
        const isValidId = IdSchema.safeParse(req.user.id);
        if(!isValidId.success){
            throw ApiError.badRequest(JSON.stringify(isValidId.error))
        }
        else{
            let fullProfile: ProfileDto;
            try{
                fullProfile = await READ.fullProfile(req.user.id);
            } catch (error){
                throw ApiError.internal(`Something went wrong: ${error}`)
            }
            if(fullProfile){
                res.status(200).json({status: "success", data: fullProfile});
            }
            else{
                throw ApiError.badRequest(`Couldn't find the profile: ${req.user.id}`)
            }
        }
    }
)

export const controller = {
    getFavorites,
    newFavorites,
    deleteFavorites,
    getFullProfile,
}