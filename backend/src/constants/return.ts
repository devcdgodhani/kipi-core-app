export enum RETURN_STATUS {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    PICKED_UP = 'PICKED_UP',
    RECEIVED = 'RECEIVED',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

export enum RETURN_REASON {
    DEFECTIVE = 'DEFECTIVE',
    WRONG_ITEM = 'WRONG_ITEM',
    QUALITY_ISSUE = 'QUALITY_ISSUE',
    SIZE_FIT_ISSUE = 'SIZE_FIT_ISSUE',
    NOT_NEED_ANYMORE = 'NOT_NEED_ANYMORE',
    OTHER = 'OTHER'
}

export const RETURN_SUCCESS_MESSAGES = {
    CREATED: 'Return request submitted successfully',
    UPDATED: 'Return status updated successfully',
    DELETED: 'Return record removed'
};

export const RETURN_ERROR_MESSAGES = {
    NOT_FOUND: 'Return request not found',
    INVALID_TRANSITION: 'Invalid return status transition',
    MAX_PERIOD_EXCEEDED: 'Return period has expired for this order'
};
