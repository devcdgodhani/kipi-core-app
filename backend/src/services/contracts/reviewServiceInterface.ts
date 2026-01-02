import { IReviewAttributes, IReviewDocument } from '../../interfaces/review';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IReviewService extends IMongooseCommonService<IReviewAttributes, IReviewDocument> {}
