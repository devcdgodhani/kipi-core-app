export interface WhatsAppAccount {
  _id: string;
  name: string;
  externalId: string;
  socketStatus: 'CONNECTED' | 'DISCONNECTED' | 'QR_READY' | 'CONNECTING' | 'INITIALIZING';
  qrCode?: string;
  isAutoResume: boolean;
  number?: string;
  activatedAt?: Date;
  numberActivatedAt?: Date;
  status: 'ACTIVE' | 'COOLDOWN' | 'BLOCKED' | 'DISCONNECTED' | 'DISABLED';
  sentToday: number;
  sentThisHour: number;
  lastSentAt?: Date;
  riskScore: number;
  metadata: {
    totalSent: number;
    totalFailed: number;
    totalReplies: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppContact {
  _id: string;
  mobile: string;
  consent: boolean;
  state: 'NEW' | 'ENGAGED' | 'DND';
  lastRepliedAt?: Date;
  totalReplies: number;
  metadata: {
    firstContactedAt: Date;
    lastContactedAt?: Date;
    totalMessagesSent: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppMessage {
  _id: string;
  accountId: string;
  contactId: string;
  message: string;
  templateId?: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failureReason?: string;
  jobId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppRiskEvent {
  _id: string;
  accountId: string;
  eventType: 'FAST_SEND' | 'NO_REPLY' | 'USER_BLOCK' | 'USER_REPORT' | 'REPLY_RECEIVED';
  points: number;
  timestamp: Date;
  metadata?: any;
}

export interface DashboardStats {
  messagesSentToday: number;
  failedMessages: number;
  queueSize: {
    waiting: number;
    active: number;
    delayed: number;
    failed: number;
  };
  activeAccounts: number;
  averageRiskScore: number;
  repliesToday: number;
}

export interface QueueStats {
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
  recentFailures: Array<{
    jobId: string;
    failedAt: Date;
    error: string;
    data: any;
  }>;
}
