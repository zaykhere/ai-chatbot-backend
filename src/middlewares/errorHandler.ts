import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { CustomAPIError } from '../errors/customError';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

const errorHandler = (
  err: Error | ZodError | CustomAPIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    return sendError(
      res,
      'Validation failed',
      400,
      validationError.details
    );
  }

  // Handle custom API errors
  if (err instanceof CustomAPIError) {
    return sendError(
      res,
      err.message,
      err.statusCode,
      [err.details]
    );
  }

  // Handle other errors
  logger.error(err.stack);
  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    500
  );
};

export { errorHandler };