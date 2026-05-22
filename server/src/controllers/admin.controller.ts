import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { READ } from '../db/readQueries.js';
import { ApiResponse, AdminStatisticsDto } from '../types/index.js';

const getStatistics = asyncHandler(
  async (_req: Request, res: Response<ApiResponse<AdminStatisticsDto>>) => {
    const data = await READ.adminStatistics();
    res.status(200).json({
      status: 'success',
      data,
    });
  }
);

export const controller = {
  getStatistics,
};
