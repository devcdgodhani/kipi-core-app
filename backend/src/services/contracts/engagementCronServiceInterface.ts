export interface IEngagementCronService {
    init(): void;
    processPointsExpiryWarnings(): Promise<void>;
    processBirthdayRewards(): Promise<void>;
}
