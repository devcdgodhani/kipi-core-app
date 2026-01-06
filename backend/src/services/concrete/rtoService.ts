import { RTOModel } from '../../db/mongodb/models/rtoModel';
import { IRtoService } from '../contracts/rtoServiceInterface';
import { IRtoAttributes, IRtoDocument } from '../../interfaces/rto';
import { MongooseCommonService } from './mongooseCommonService';

export class RtoService extends MongooseCommonService<IRtoAttributes, IRtoDocument> implements IRtoService {
    constructor() {
        super(RTOModel as any);
    }
}

export const rtoService = new RtoService();
