import { IReturn } from '../../interfaces/return';
import { RETURN_STATUS } from '../../constants/return';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IReturnService extends IMongooseCommonService<IReturn, IReturn> {
    generateReturnNumber(): string;
    requestReturn(data: Partial<IReturn>): Promise<IReturn>;
    updateReturnStatus(id: string, status: RETURN_STATUS, adminNotes?: string): Promise<IReturn | null>;
    cancelReturn(id: string, userId: string): Promise<IReturn | null>;
}
