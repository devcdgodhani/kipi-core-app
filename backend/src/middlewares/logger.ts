import { Request, Response, NextFunction } from 'express';

export const apiLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.info(`[${req.method}] ${req.originalUrl}`);
  next();
};
