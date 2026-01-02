import { ReviewModel } from '../../db/mongodb/models/reviewModel';
import { IReviewAttributes, IReviewDocument } from '../../interfaces/review';
import { IReviewService } from '../contracts/reviewServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class ReviewService
  extends MongooseCommonService<IReviewAttributes, IReviewDocument>
  implements IReviewService
{
  constructor() {
    super(ReviewModel);
  }
}
