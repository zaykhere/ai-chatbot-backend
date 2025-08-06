class CustomAPIError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends CustomAPIError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

class ValidationError extends CustomAPIError {
  constructor(message: string, details?: unknown) {
    super(message, 400, details);
  }
}

class UnauthorizedError extends CustomAPIError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export {
  CustomAPIError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
};