import * as z from 'zod';
const IdSchema = z.uuid();


export const CreateFavoriteSchema = z.object({
    profileId: z.uuid(),
    activityId: z.uuid()
})


export const DeleteFavoriteSchema = z.object({
    profileId: z.uuid(),
    activityId: z.uuid()
})


export function isUUID(id: string): boolean
{
    return IdSchema.safeParse(id).success;
}

