import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { READ } from '../db/queries.js';
import { GetProfilesQuerySchema, parseZodError } from '../validators/index.js';
import { ApiResponse, ProfileSummaryDto } from '../types/index.js';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

const getProfiles = asyncHandler(
  async (req: Request, res: Response<ApiResponse<ProfileSummaryDto[]>>) => {
    let queryParams;
    try {
      queryParams = GetProfilesQuerySchema.parse(req.query);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ApiError.badRequest(JSON.stringify(parseZodError(error)));
      } else {
        throw ApiError.internal(`Something went wrong: ${error}`);
      }
    }

    const profiles = await READ.profilesByRole(queryParams.role);
    res.status(200).json({ status: 'success', data: profiles });
  }
);

export const controller = {
  getProfiles,
};
