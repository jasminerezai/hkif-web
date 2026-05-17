import { Request, Response } from 'express';
import { register, login } from '../services/auth.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse, AuthResponseDto, MeResponseDto, userInputRegister } from '../types/index.js';
import {authLoginInput, authRegisterInput, parseZodError, zodError} from "../validators/index.js";

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
  const validRegisterInput = authRegisterInput.safeParse(req.body);
  if(!validRegisterInput.success) {
    const error: zodError[] = parseZodError(validRegisterInput.error)
    throw ApiError.badRequest(JSON.stringify(error))
  }
  else{
    const { email, password, name } = req.body;
    const newUser: userInputRegister = {
      email,
      password,
      name
    }
    const result: AuthResponseDto = await register(newUser)
    res.status(201).json({
      status: 'success',
      data: result,
    });
  }
});

export const loginHandler = asyncHandler(async (
  req: Request,
  res: Response<ApiResponse<AuthResponseDto>>,
) => {
  const isValidInput = authLoginInput.safeParse(req.body);
  if(!isValidInput.success){
    const error: zodError[] = parseZodError(isValidInput.error);
    throw ApiError.badRequest(JSON.stringify(error))
  }
  else {

    const {email, password} = req.body;
    const result = await login(email, password);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
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
