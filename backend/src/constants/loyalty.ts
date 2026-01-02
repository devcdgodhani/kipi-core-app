export enum LOYALTY_TRANSACTION_TYPE {
    EARNED = 'EARNED',
    SPENT = 'SPENT',
    REFUNDED = 'REFUNDED',
    EXPIRED = 'EXPIRED'
}

export const LOYALTY_CONFIG = {
    POINTS_EARNED_PERCENT: 1, // 1% of order value
    POINTS_PER_RUPEE: 1,       // 1 point = 1 INR
    MIN_REDEMPTION_POINTS: 50, // Minimum points to spend
};
