import { IRtoAttributes, IRtoDocument, IRtoScoreAttributes, IRtoScoreDocument } from '../../interfaces/rto';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IRtoService extends IMongooseCommonService<IRtoAttributes, IRtoDocument> {
  // RTO specific methods
}

// RTO Score Service might not extend MongooseCommonService if it doesn't store data directly like a CRUD resource,
// or it might if we store scores. The current impl computes on fly. 
// But let's follow the pattern. If it's a computation service, it might just be a class.
// Checking User module... User service extends MongooseCommonService.
// For RTO Score, we are not checking a "Score" model for CRUD, we calculate.
// But we should define an interface for dependency injection/mocking.

export interface IRtoScoreService {
  calculateRiskScore(userId: string, pincode: string, orderAmount: number, paymentMethod: string): Promise<IRtoScoreAttributes>;
  saveRiskScore(scoreData: IRtoScoreAttributes): Promise<IRtoScoreDocument>;
}

