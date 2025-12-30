import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS_CODE, USER_SUCCESS_MESSAGES } from '../constants';
import { UserService } from '../services';
import { IApiResponse, IPaginationData, IUserAttributes, IUserDocument } from '../interfaces';
import { BaseController } from './baseController';

export default class UserController extends BaseController<IUserAttributes, IUserDocument> {
  constructor() {
    super(new UserService(), 'User');
  }
}
