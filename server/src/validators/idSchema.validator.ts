import z from 'zod';

export const IdSchema = z.uuid();

export function isUUID(id: string): boolean
{
    return IdSchema.safeParse(id).success;
}