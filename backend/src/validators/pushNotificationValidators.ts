import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { PUSH_TARGET_TYPE } from '../constants/pushNotification';

export const pushNotificationValidator = {
  create: (req: Request, res: Response, next: NextFunction) => {
    const schema = z.object({
      title: z.string().min(1),
      body: z.string().min(1),
      imageUrl: z.string().optional(),
      data: z.record(z.string(), z.any()).optional(),
      target: z.object({
        type: z.enum(Object.values(PUSH_TARGET_TYPE) as [string, ...string[]]),
        values: z.array(z.string()).optional()
      }),
      scheduling: z.object({
        isScheduled: z.boolean().default(false),
        scheduledAt: z.string().datetime().optional()
      }).optional()
    });

    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  },

  getAll: (req: Request, res: Response, next: NextFunction) => {
    // Optional filter validation
    next();
  },

  getOne: (req: Request, res: Response, next: NextFunction) => {
    // Optional filter validation
    next();
  },

  getWithPagination: (req: Request, res: Response, next: NextFunction) => {
    const schema = z.object({
      query: z.record(z.string(), z.any()).optional(),
      options: z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
        sort: z.record(z.string(), z.any()).optional()
      }).optional()
    });
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        next(error);
    }
  },

  updateById: (req: Request, res: Response, next: NextFunction) => {
    const schema = z.object({
        title: z.string().optional(),
        body: z.string().optional(),
        // other fields optional
    });
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        next(error);
    }
  },

  deleteByFilter: (req: Request, res: Response, next: NextFunction) => {
      const schema = z.object({
          _id: z.string().optional()
      });
       try {
        schema.parse(req.body);
        next();
    } catch (error) {
        next(error);
    }
  },

  registerDevice: (req: Request, res: Response, next: NextFunction) => {
    const schema = z.object({
      token: z.string().min(1),
      platform: z.string().optional()
    });

    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  },
  
  unregisterDevice: (req: Request, res: Response, next: NextFunction) => {
    const schema = z.object({
      token: z.string().min(1)
    });

    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  }
};
