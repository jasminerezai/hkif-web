import { ApiError } from "../utils/ApiError";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";

import CREATE from "../db/createQueries";
import DELETE from "../db/deleteQueries";
import UPDATE from "../db/updateQueries";

import READ from "../db/readQueries";
import { CreateActivitySchema, DeleteActivitySchema, UpdateActivityGeneralSchema, UpdateActivityURLSchema } from "../validators/activity.validator";
import { Activity } from "../types/activity.types";


const newActivity = asyncHandler(
    async (req: Request, res: Response) => {
        let newActivity: Activity;

        try {
            newActivity = CreateActivitySchema.parse(req.body);
        } catch (error) {
            console.error(error);
            throw ApiError.badRequest(`Invalid request body: ${error}`);
        }

        // If no leaders provided, assign the creator as the leader
        if (!newActivity.leaders || newActivity.leaders.length === 0) {
            if (req.user?.id) {
                newActivity.leaders = [req.user.id];
            }
        }

        try {
            const data = await CREATE.newActivity(newActivity);
            res.status(201).json({
                status: "success",
                data,
            });
        } catch (error) {
            throw ApiError.internal(`Something went wrong: ${error}`);
        }
    }
);

const updateActivity = asyncHandler(
    async (req: Request, res: Response) => {
        let updateParams: { id: string; };
        let updateBody: Partial<Activity>;

        try {
            updateParams = UpdateActivityURLSchema.parse(req.params);
            updateBody = UpdateActivityGeneralSchema.parse(req.body);
        } catch (error) {
            console.error(error);
            throw ApiError.badRequest(`Invalid request body or params: ${error}`);
        }

        // Check if activity exists before attempting update
        const existingActivity = await READ.activityById(updateParams.id);
        if (!existingActivity) {
            throw ApiError.notFound(`Activity with id ${updateParams.id} not found`);
        }

        let updatePayload: Partial<Activity> = {};

        // Only include fields that are present in the request body
        for (const field of Object.keys(updateBody)) {
            const key = field as keyof Activity;
            if (updateBody[key] !== undefined) {
                (updatePayload as Record<string, unknown>)[field] = updateBody[key];
            }
        }

        try {
            const updatedActivity = await UPDATE.updateActivity(updateParams.id, updatePayload);
            res.status(200).json({
                status: "success",
                data: updatedActivity,
            });
        } catch (error) {
            console.error(error);
            throw ApiError.internal(`Something went wrong: ${error}`);
        }
    }
);

const deleteActivity = asyncHandler(
    async (req: Request, res: Response) => {
        let deleteParams: { id: string; };
        try {
            deleteParams = DeleteActivitySchema.parse(req.params);
        } catch (error) {
            console.error(error);
            throw ApiError.badRequest(`Invalid request params: ${error}`);
        }

        // Check if activity exists before attempting deletion
        const existingActivity = await READ.activityById(deleteParams.id);
        if (!existingActivity) {
            throw ApiError.notFound(`Activity with id ${deleteParams.id} not found`);
        }

        try {
            await DELETE.deleteActivity(deleteParams.id);
            res.status(200).json({
                status: "success",
            });
        } catch (error) {
            console.error(error);
            throw ApiError.internal(`Something went wrong: ${error}`);
        }
    }
);

const getActivities = asyncHandler(
    async (_req: Request, res: Response) => {
        try {
            const data = await READ.allActivities();
            res.status(200).json({
                status: "success",
                data,
            });
        } catch (error) {
            console.error(error);
            throw ApiError.internal(`Something went wrong: ${error}`);
        }
    }
);

export const controller = {
    newActivity,
    updateActivity,
    deleteActivity,
    getActivities,
};
