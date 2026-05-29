import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { Prisma } from '../generated/prisma/index.js';
import { prismaErrorFormatter } from "../utils/prismaErrorFormatter.js";

/**
 * Global error handler middleware.
 * Must be registered LAST in the middleware chain (after all routes).
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
    return;
  }
  if( err instanceof Prisma.PrismaClientKnownRequestError ){
    const prismaErr = prismaErrorFormatter(err);
    res.status(prismaErr.statusCode).json(prismaErr);
    return;
  }

  // Unexpected error — log and return generic 500
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    statusCode: 500,
  });
}
