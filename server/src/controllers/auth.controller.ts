import { Request, Response } from 'express';
import { register, login } from '../services/auth.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {ApiResponse, AuthResponseDto, MeResponseDto, userInputLogin, userInputRegister} from '../types/index.js';
import {authLoginSchema, authRegisterSchema, parseZodError} from "../validators/index.js";
import {ZodError} from "zod";

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
  let newUser: userInputRegister;
  try{
    newUser = authRegisterSchema.parse(req.body);
  } catch (error){
    if(error instanceof ZodError){
      throw ApiError.badRequest(JSON.stringify(parseZodError(error)))
    }
    else{
      throw ApiError.internal(`Something went wrong: ${error}`)
    }
  }
  const result: AuthResponseDto = await register(newUser)
  res.status(201).json({
    status: 'success',
    data: result,
  });
});

export const loginHandler = asyncHandler(async (
  req: Request,
  res: Response<ApiResponse<AuthResponseDto>>,
) => {
  let data: userInputLogin;
  try {
    data = authLoginSchema.parse(req.body)
  } catch(error){
    if(error instanceof ZodError) throw ApiError.badRequest(JSON.stringify(parseZodError(error)))
    else throw ApiError.internal(`Something went wrong: ${error}`)
  }

    // const {email, password} = req.body;
    const result = await login(data.email, data.password);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  // }
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
