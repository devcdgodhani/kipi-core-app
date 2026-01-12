export interface IPulseService {
    triggerFeedbackRequest(order: any): Promise<void>;
    triggerWalletCreditPulse(userId: string, amount: number, orderNumber: string): Promise<void>;
    triggerBirthdayReward(user: any): Promise<void>;
    triggerWalletExpiryWarning(user: any, amount: number, daysRemaining: number): Promise<void>;
}
