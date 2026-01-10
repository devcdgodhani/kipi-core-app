import { Document, ObjectId } from 'mongoose';
import { SEARCH_QUERY_STATUS } from '../constants';
import { IDefaultAttributes } from './common';

export interface ISearchQueryAttributes extends IDefaultAttributes {
  _id: ObjectId;
  userId?: ObjectId;
  query: string;
  resultCount: number;
  status: SEARCH_QUERY_STATUS;
}

export interface ISearchQueryDocument extends Omit<ISearchQueryAttributes, '_id'>, Document {}
