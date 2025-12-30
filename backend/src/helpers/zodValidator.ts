import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ApiError } from './apiError';
import { HTTP_STATUS_CODE } from '../constants';

export const validate = (schema: z.ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = (await schema.parseAsync({
        body: req.body || {},
        query: req.query || {},
        params: req.params || {},
      })) as any;

      // Merge all validated data into req.body as requested to avoid 'getter-only' property errors
      req.body = {
        ...(validatedData.body || {}),
        ...(validatedData.query || {}),
        ...(validatedData.params || {}),
      };

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');
        return next(
          new ApiError(
            HTTP_STATUS_CODE.BAD_REQUEST.CODE,
            HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
            errorMessage
          )
        );
      }
      return next(error);
    }
  };
