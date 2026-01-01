/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response } from 'express';
import { ENV_VARIABLE, logger } from '../configs';
import { HTTP_STATUS_CODE } from '../constants';
import { ApiError } from '../helpers';
import { IApiResponse } from '../interfaces';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    let status = err.status || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS;
    let code = err.code || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.CODE;
    let message = err.message || 'Internal server error';

    if (ENV_VARIABLE.NODE_ENV !== 'test') {
      console.log('errorHandler', err);
    }

    /************************ Remove this comment for production server ************************************/

    if (ENV_VARIABLE.NODE_ENV === 'production' && !err.isOperational) {
      status = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS;
      code = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.CODE;
      message = 'Internal server error';
    }

    // if (ENV_VARIABLE.NODE_ENV === 'production' || ENV_VARIABLE.NODE_ENV === 'development') {
    //     const endpoint = `${req.method} =>  ${req.originalUrl}`;
    //     const headersData = {
    //         ...(req.headers.deviceinfo && { deviceInfo: req.headers.deviceinfo }),
    //         ...(req.headers.packageinfo && { packageInfo: req.headers.packageinfo }),
    //         ...(req.headers.appType && { appType: req.headers.appType }),
    //         ...(req.headers.requestFrom && { requestFrom: req.headers.requestFrom }),
    //         ...(req.headers.instituteid && { requestFrom: req.headers.instituteid }),
    //     };
    //     sendErrorNotification('critical', err?.message || 'Unknown error', endpoint, req.body, headersData);
    // }

    const response: IApiResponse = {
      code,
      message,
      status,
    };

    if (ENV_VARIABLE.NODE_ENV === 'development' || ENV_VARIABLE.NODE_ENV === 'local') {
      logger.error(err);
      response.error = err.stack;
    }

    return res.status(status).send(response);
  } catch (err) {
    next(err);
  }
};

export const errorConverter = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const status = error.status
      ? HTTP_STATUS_CODE.BAD_REQUEST.STATUS
      : HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS;

    const code = error.code
      ? HTTP_STATUS_CODE.BAD_REQUEST.CODE
      : HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.CODE;
    const message = error.message || 'Internal server error';
    error = new ApiError(code, status, message, false, err.stack);
  }
  // errorHandler(error, req, res, next);
  next(error);
};
