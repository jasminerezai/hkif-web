import * as z from "zod";
import {regTime} from "../utils/reggex.js";

const checkTimeFormat = (time: string) => {
    return regTime(time);
};

export const CreateActivitySchema = z.object({
    name: z.string(),
    location: z.string(),
    leaders: z.array(z.uuid()),
    description: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    maxCapacity: z.number().int().positive().optional(),
    defaultStatus: z.enum(["ACTIVE", "INACTIVE", "CANCELLED", "DELAYED"]).optional(),
    timeSlots: z.array(z.object({
        weekday: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
        startAt: z.string().refine((time) => checkTimeFormat(time), {
            message: "Invalid time format, expected HH:mm:ss",
        }),
        endAt: z.string().refine((time) => checkTimeFormat(time), {
            message: "Invalid time format, expected HH:mm:ss",
        }),
    })),
});

export const DeleteActivitySchema = z.object({
    activityId: z.uuid(),
});

export const UpdateActivityURLSchema = z.object({
    activityId: z.uuid(),
});

export const TimeSlotSchema = z.object({
    weekday: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
    startAt: z.string().refine((time) => checkTimeFormat(time), {
        message: "Invalid time format, expected HH:mm:ss",
    }),
    endAt: z.string().refine((time) => checkTimeFormat(time), {
        message: "Invalid time format, expected HH:mm:ss",
    }),
});

export const UpdateActivityGeneralSchema = z.object({
    name: z.string().optional(),
    location: z.string().optional(),
    description: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    maxCapacity: z.number().int().positive().optional(),
    defaultStatus: z.enum(["ACTIVE", "INACTIVE", "CANCELLED", "DELAYED"]).optional(),
    timeSlots: z.array(TimeSlotSchema).min(1, {
        message: "At least one time slot must be provided",
    }).optional(),
    leaders: z.array(z.uuid()).min(1, {
        message: "At least one leader must be provided",
    }).optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field to update must be provided",
});

export const StatusValidationSchema = z.enum(["ACTIVE", "INACTIVE", "CANCELLED", "DELAYED"]);
