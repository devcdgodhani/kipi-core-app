import { differenceInDays, getHours, getMinutes, addMinutes, addHours, startOfDay } from 'date-fns';
import { IWhatsAppAccountAttributes } from '../../interfaces';

interface ThrottleLimits {
  maxPerDay: number;
  minGapMinutes: number;
  allowIdenticalMessages: boolean;
  category: 'NEW' | 'WARMED' | 'AGED' | 'WELL-AGED';
}

interface CanSendResult {
  allowed: boolean;
  reason?: string;
  nextAvailableAt?: Date;
}

export class WhatsAppThrottleService {
  private static readonly HARD_CAP_PER_DAY = 200;
  
  // Time windows: 09:00-11:00, 13:00-15:00, 18:00-21:00
  private static readonly ALLOWED_TIME_WINDOWS = [
    { start: 9, end: 11 },   // 9 AM - 11 AM
    { start: 13, end: 15 },  // 1 PM - 3 PM
    { start: 18, end: 21 },  // 6 PM - 9 PM
  ];

  /**
   * Calculate the age of a WhatsApp number in days
   */
  calculateNumberAge(activatedAt: Date): number {
    return differenceInDays(new Date(), activatedAt);
  }

  /**
   * Get throttle limits based on number age
   */
  getLimits(account: IWhatsAppAccountAttributes): ThrottleLimits {
    const ageInDays = this.calculateNumberAge(account.activatedAt || new Date());

    if (ageInDays <= 7) {
      // NEW (0-7 days): Very strict limits
      return {
        maxPerDay: 10,
        minGapMinutes: 7, // 5-10 minutes, using 7 as middle
        allowIdenticalMessages: false,
        category: 'NEW',
      };
    } else if (ageInDays <= 30) {
      // WARMED (8-30 days): Moderate limits
      return {
        maxPerDay: 40,
        minGapMinutes: 2, // 1-3 minutes, using 2 as middle
        allowIdenticalMessages: false,
        category: 'WARMED',
      };
    } else if (ageInDays <= 60) {
      // AGED (31-60 days): Relaxed limits
      return {
        maxPerDay: 70,
        minGapMinutes: 1.5, // 1-2 minutes, using 1.5 as middle
        allowIdenticalMessages: true,
        category: 'AGED',
      };
    } else {
      // WELL-AGED (60+ days): Most relaxed limits
      return {
        maxPerDay: 100,
        minGapMinutes: 1, // 30-90 seconds, using 1 minute
        allowIdenticalMessages: true,
        category: 'WELL-AGED',
      };
    }
  }

  /**
   * Check if account can send a message now
   */
  canSendNow(account: IWhatsAppAccountAttributes): CanSendResult {
    const limits = this.getLimits(account);

    // Check 1: Daily limit
    if (account.sentToday >= limits.maxPerDay) {
      return {
        allowed: false,
        reason: `Daily limit reached (${limits.maxPerDay} messages for ${limits.category} number)`,
        nextAvailableAt: addHours(startOfDay(new Date()), 24), // Tomorrow at midnight
      };
    }

    // Check 2: Hard cap
    if (account.sentToday >= WhatsAppThrottleService.HARD_CAP_PER_DAY) {
      return {
        allowed: false,
        reason: `Hard cap reached (${WhatsAppThrottleService.HARD_CAP_PER_DAY} messages/day)`,
        nextAvailableAt: addHours(startOfDay(new Date()), 24),
      };
    }

    // Check 3: Minimum gap between messages
    if (account.lastSentAt) {
      const minutesSinceLastSend = differenceInDays(new Date(), account.lastSentAt) * 24 * 60 +
        (getHours(new Date()) - getHours(account.lastSentAt)) * 60 +
        (getMinutes(new Date()) - getMinutes(account.lastSentAt));

      if (minutesSinceLastSend < limits.minGapMinutes) {
        const nextAvailable = addMinutes(account.lastSentAt, limits.minGapMinutes);
        return {
          allowed: false,
          reason: `Minimum gap not met (${limits.minGapMinutes} minutes required for ${limits.category} number)`,
          nextAvailableAt: nextAvailable,
        };
      }
    }

    // Check 4: Time window
    const timeWindowCheck = this.isWithinAllowedTimeWindow();
    if (!timeWindowCheck.allowed) {
      return {
        allowed: false,
        reason: timeWindowCheck.reason,
        nextAvailableAt: timeWindowCheck.nextAvailableAt,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if current time is within allowed sending windows
   */
  isWithinAllowedTimeWindow(): CanSendResult {
    const now = new Date();
    const currentHour = getHours(now);

    // Block 12:00 AM - 7:00 AM
    if (currentHour >= 0 && currentHour < 7) {
      const nextWindow = new Date(now);
      nextWindow.setHours(9, 0, 0, 0);
      return {
        allowed: false,
        reason: 'Outside allowed time window (blocked 12 AM - 7 AM)',
        nextAvailableAt: nextWindow,
      };
    }

    // Check if within any allowed window
    const isInWindow = WhatsAppThrottleService.ALLOWED_TIME_WINDOWS.some(
      (window) => currentHour >= window.start && currentHour < window.end
    );

    if (isInWindow) {
      return { allowed: true };
    }

    // Calculate next available window
    const nextWindow = this.calculateNextTimeSlot();
    return {
      allowed: false,
      reason: `Outside allowed time windows (9-11 AM, 1-3 PM, 6-9 PM)`,
      nextAvailableAt: nextWindow,
    };
  }

  /**
   * Calculate the next available time slot
   */
  calculateNextTimeSlot(): Date {
    const now = new Date();
    const currentHour = getHours(now);
    const nextSlot = new Date(now);

    // Find next window
    for (const window of WhatsAppThrottleService.ALLOWED_TIME_WINDOWS) {
      if (currentHour < window.start) {
        nextSlot.setHours(window.start, 0, 0, 0);
        return nextSlot;
      }
    }

    // If past all windows today, return first window tomorrow
    nextSlot.setDate(nextSlot.getDate() + 1);
    nextSlot.setHours(WhatsAppThrottleService.ALLOWED_TIME_WINDOWS[0].start, 0, 0, 0);
    return nextSlot;
  }

  /**
   * Calculate delay in milliseconds until next available send time
   */
  calculateDelayUntil(nextAvailableAt: Date): number {
    return Math.max(0, nextAvailableAt.getTime() - Date.now());
  }
}
export const whatsAppThrottleService = new WhatsAppThrottleService();
