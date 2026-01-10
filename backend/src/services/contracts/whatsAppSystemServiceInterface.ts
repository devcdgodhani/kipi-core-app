export interface IWhatsAppSystemServiceContract {
    getQueueStatus(): Promise<any>;
    retryFailedJobs(): Promise<number>;
    cleanQueue(status: string, limit?: number): Promise<number>;
    clearQueue(): Promise<void>;
    pauseQueue(): Promise<void>;
    resumeQueue(): Promise<void>;
    resetCounters(): Promise<void>;
}
