import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { CustomAPIError } from '../errors/customError';
import { logger } from '../utils/logger';

interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: unknown[];
  stack?: string;
}

const errorHandler = (
  err: Error | ZodError | CustomAPIError,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  // Default error response
  let errorResponse: ErrorResponse = {
    success: false,
    message: err.message || 'Something went wrong',
  };

  let statusCode = 500;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    statusCode = 400;
    errorResponse.message = 'Validation Error';
    errorResponse.errors = validationError.details;
  }
  // Handle custom API errors
  else if (err instanceof CustomAPIError) {
    statusCode = err.statusCode;
    errorResponse.message = err.message;
  }
  // Handle 404 errors
  else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorResponse.message = 'Resource not found';
  }
  // Handle duplicate key errors (MongoDB)
  else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = 409;
    errorResponse.message = 'Duplicate key error';
    errorResponse.errors = [(err as any).keyValue];
  }

  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    statusCode,
  });

  // Only include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export { errorHandler };