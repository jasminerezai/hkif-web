import * as z from "zod";

export const ScheduleDateSchema = z.nullish(z.union([
    z.iso.date(),
    z.literal("today")
])).default(new Date().toISOString());

export const ScheduleBoolWeekSchema = z.nullish(z.stringbool()).default(true);

export const CreateScheduleSchema = z.object({
    activityId: z.string().uuid(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date().nullable().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "CANCELLED", "DELAYED"]).optional(),
});

export const UpdateScheduleSchema = z.object({
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().nullable().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "CANCELLED", "DELAYED"]).optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field to update must be provided",
});

export const ScheduleIdParamSchema = z.object({
    scheduleId: z.string().uuid(),
});