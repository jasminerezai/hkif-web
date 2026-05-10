import { Request, Response } from 'express';
import { register, login } from '../services/auth.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse, AuthResponseDto, MeResponseDto } from '../types';

/**
 * Success response shape:
 *   { status: 'success', data: <payload> }
 *
 * Error responses are handled globally by errorHandler.ts and follow:
 *   { error: <message>, statusCode: <number> }
 */

export const registerHandler = asyncHandler(async (
  req: Request,
  res: Response<ApiResponse<AuthResponseDto>>,
) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw ApiError.badRequest('Please provide email, password, and name');
  }

  // Basic validation
  if (password.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters long');
  }

  const result = await register(email, password, name);

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

export const loginHandler = asyncHandler(async (
  req: Request,
  res: Response<ApiResponse<AuthResponseDto>>,
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Please provide email and password');
  }

  const result = await login(email, password);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getMeHandler = asyncHandler(async (
  req: Request,
  res: Response<ApiResponse<MeResponseDto>>,
) => {
  // req.user is populated by the protect middleware after token verification
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
});
