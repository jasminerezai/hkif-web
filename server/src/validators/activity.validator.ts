import * as z from "zod";

const checkTimeFormat = (time: string) => {
    const timeSplit = time.split(":");
    if (timeSplit.length !== 3) return false;
    const [hours, minutes, seconds] = timeSplit.map(Number);
    return (
        Number.isInteger(hours) && hours! >= 0 && hours! <= 23 &&
        Number.isInteger(minutes) && minutes! >= 0 && minutes! <= 59 &&
        Number.isInteger(seconds) && seconds! >= 0 && seconds! <= 59
    );
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
    id: z.uuid(),
});

export const UpdateActivityURLSchema = z.object({
    id: z.uuid(),
});

const TimeSlotSchema = z.object({
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
