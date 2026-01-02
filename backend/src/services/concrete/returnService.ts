import { ReturnModel } from '../../db/mongodb/models/returnModel';
import { IReturn } from '../../interfaces/return';
import { MongooseCommonService } from './mongooseCommonService';
import { RETURN_STATUS } from '../../constants/return';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';

export class ReturnService extends MongooseCommonService<IReturn, IReturn> {
    constructor() {
        super(ReturnModel);
    }

    generateReturnNumber = (): string => {
        const date = new Date();
        const prefix = 'RET';
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${dateStr}-${random}`;
    };

    async requestReturn(data: Partial<IReturn>): Promise<IReturn> {
        const returnNumber = this.generateReturnNumber();
        const timeline = [{
            status: RETURN_STATUS.PENDING,
            timestamp: new Date(),
            message: 'Return request submitted by customer'
        }];

        return this.create({
            ...data,
            returnNumber,
            status: RETURN_STATUS.PENDING,
            timeline
        });
    }

    async updateReturnStatus(id: string, status: RETURN_STATUS, adminNotes?: string): Promise<IReturn | null> {
        const returnRequest = await this.findById(id);
        if (!returnRequest) {
            throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'Return request not found');
        }

        const timelineEntry = {
            status,
            timestamp: new Date(),
            message: `Return status updated to ${status}. ${adminNotes || ''}`
        };

        const updateData: any = {
            status,
            $push: { timeline: timelineEntry }
        };

        if (adminNotes) updateData.adminNotes = adminNotes;

        return this.updateOne({ _id: id }, updateData);
    }
}

export const returnService = new ReturnService();
