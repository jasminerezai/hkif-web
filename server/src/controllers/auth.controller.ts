import { Request, Response } from 'express';
import { register, login } from '../services/auth.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new ApiError(400, 'Please provide email, password, and name');
  }

  // Basic validation
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }

  const result = await register(email, password, name);

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  const result = await login(email, password);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
