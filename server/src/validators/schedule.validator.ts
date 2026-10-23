import * as z from "zod";

export const ScheduleDateSchema = z.nullish(z.union([
    z.string().date(),
    z.string().datetime(),
    z.literal("today")
])).default(() => new Date().toISOString());

export const ScheduleBoolWeekSchema = z.nullish(z.stringbool()).default(true);

export const ScheduleRangeQuerySchema = z.object({
    startDate: z.union([z.string().date(), z.string().datetime(), z.literal("today")]).optional(),
    endDate: z.union([z.string().date(), z.string().datetime(), z.literal("today")]).optional(),
    from: z.union([z.string().date(), z.string().datetime(), z.literal("today")]).optional(),
    to: z.union([z.string().date(), z.string().datetime(), z.literal("today")]).optional(),
    start: z.union([z.string().date(), z.string().datetime(), z.literal("today")]).optional(),
    end: z.union([z.string().date(), z.string().datetime(), z.literal("today")]).optional(),
    month: z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format").optional(),
});

export function parseDateRange(query: unknown): { startDate: Date; endDate: Date } {
    const parsed = ScheduleRangeQuerySchema.parse(query);

    if (parsed.month) {
        const [yearStr, monthStr] = parsed.month.split("-");
        const year = parseInt(yearStr!, 10);
        const monthNum = parseInt(monthStr!, 10);
        const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));
        return { startDate, endDate };
    }

    const rawStart = parsed.startDate ?? parsed.from ?? parsed.start;
    const rawEnd = parsed.endDate ?? parsed.to ?? parsed.end;

    if (!rawStart || !rawEnd) {
        throw new Error("Both startDate and endDate are required");
    }

    let startDate: Date;
    if (rawStart === "today") {
        startDate = new Date();
        startDate.setUTCHours(0, 0, 0, 0);
    } else {
        startDate = new Date(rawStart);
        if (/^\d{4}-\d{2}-\d{2}$/.test(rawStart)) {
            startDate.setUTCHours(0, 0, 0, 0);
        }
    }

    let endDate: Date;
    if (rawEnd === "today") {
        endDate = new Date();
        endDate.setUTCHours(23, 59, 59, 999);
    } else {
        endDate = new Date(rawEnd);
        if (/^\d{4}-\d{2}-\d{2}$/.test(rawEnd)) {
            endDate.setUTCHours(23, 59, 59, 999);
        }
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date provided");
    }

    if (startDate > endDate) {
        throw new Error("startDate must be before or equal to endDate");
    }

    return { startDate, endDate };
}

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