import { Response } from 'express';

interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: string;
  errors?: unknown[];
}

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200): void => {
  const response: SuccessResponse<T> = {
    success: true,
    data
  };
  res.status(statusCode).json(response);
};

export const sendError = (res: Response, error: string, statusCode = 400, errors?: unknown[]): void => {
  const response: ErrorResponse = {
    success: false,
    error,
    ...(errors && { errors })
  };
  res.status(statusCode).json(response);
};