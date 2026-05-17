import * as z from 'zod';

export const FavoriteSchema = z.object({
    profileId: z.uuid(),
    activityId: z.uuid()
})
export const CreateFavoriteSchema = FavoriteSchema


export const DeleteFavoriteSchema = FavoriteSchema;


