import * as z from "zod";

export const ScheduleDateSchema = z.nullish(z.union([
    z.iso.date(),
    z.literal("today")
])).default(new Date().toISOString());

export const ScheduleBoolWeekSchema = z.nullish(z.stringbool()).default(true);