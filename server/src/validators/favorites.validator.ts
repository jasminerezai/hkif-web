import * as z from 'zod';
const IdSchema = z.uuid();

export const FavoriteSchema = z.object({
    profileId: z.uuid(),
    activityId: z.uuid()
})
export const CreateFavoriteSchema = FavoriteSchema


export const DeleteFavoriteSchema = FavoriteSchema;


export function isUUID(id: string): boolean
{
    return IdSchema.safeParse(id).success;
}

