
// Account Related Types
export interface ICreateAccountReq {
    name: string;
    number?: string;
    numberActivatedAt?: string;
    isAutoResume?: boolean;
}

export interface IUpdateAccountReq {
    name?: string;
    isAutoResume?: boolean;
}

export interface ISendMessageReq {
    to: string;
    message?: string;
    templateId?: string;
    templateData?: Record<string, any>;
    accountId: string;
}

export interface ISendBulkMessageReq {
    recipients: string[];
    message?: string;
    templateId?: string;
    templateData?: Record<string, any>;
    accountId: string;
}

// Contact Related Types
export interface IUpdateConsentReq {
    consent: boolean;
}

// System/Queue Related Types
export interface IQueueStatusRes {
    waiting: number;
    active: number;
    delayed: number;
    failed: number;
    completed: number;
    paused: number;
    recentFailures: {
        jobId: string;
        error: string;
        failedAt: Date;
    }[];
}

// Risk Related Types
export interface ILogRiskEventReq {
    eventType: string;
    metadata?: Record<string, any>;
    accountId?: string;
}

export interface IRiskBreakdownRes {
    totalRiskScore: number;
    eventBreakdown: {
        _id: string; // eventType
        count: number;
        totalPoints: number;
    }[];
}
