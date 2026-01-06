export interface IPulseService {
    triggerFeedbackRequest(order: any): Promise<void>;
    triggerLoyaltyAccretionPulse(userId: string, points: number, orderNumber: string): Promise<void>;
    triggerBirthdayReward(user: any): Promise<void>;
    triggerPointsExpiryWarning(user: any, points: number, daysRemaining: number): Promise<void>;
}
