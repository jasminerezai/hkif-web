import type { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler so thrown errors are forwarded to Express error handling.
 * Eliminates try-catch boilerplate in every controller function.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
