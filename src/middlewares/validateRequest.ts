import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodObject } from 'zod';
import { fromError } from 'zod-validation-error';

const validateRequest = (schema: ZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const err = fromError(error);
        return res.status(400).json({
          success: false,
          error: `Validation failed: ${err.details?.[0]?.message}`,
          errors: err.details.map((item) => item.message)
        })
      }
      return next(error);
    }
  };

export default validateRequest;