import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { ApiError } from '../helpers';
import { HTTP_STATUS_CODE } from '../constants';

export const validateRequest =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        // Provide a clearer error message
        const message = errorMessages.map(e => `${e.path}: ${e.message}`).join(', ');
        return next(new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, message));
      }
      return next(error);
    }
  };
