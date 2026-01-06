import { Schema, model, Types, Document } from 'mongoose';

export enum CRON_JOB_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PAUSED = 'PAUSED'
}

export enum CRON_JOB_LEVEL {
  SYSTEM = 'SYSTEM',
  USER = 'USER'
}

export interface ICronJob extends Document {
  name: string;
  identifier: string; // unique string to map to a function handler
  description?: string;
  expression: string; // cron-tab expression
  status: CRON_JOB_STATUS;
  level: CRON_JOB_LEVEL;
  lastRun?: Date;
  nextRun?: Date;
  lastResult?: 'SUCCESS' | 'FAILURE';
  lastError?: string;
  config?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
}

const cronJobSchema = new Schema<ICronJob>(
  {
    name: { type: String, required: true },
    identifier: { type: String, required: true, unique: true },
    description: { type: String },
    expression: { type: String, required: true },
    status: { type: String, enum: Object.values(CRON_JOB_STATUS), default: CRON_JOB_STATUS.ACTIVE },
    level: { type: String, enum: Object.values(CRON_JOB_LEVEL), default: CRON_JOB_LEVEL.SYSTEM },
    lastRun: { type: Date },
    nextRun: { type: Date },
    lastResult: { type: String, enum: ['SUCCESS', 'FAILURE'] },
    lastError: { type: String },
    config: { type: Schema.Types.Mixed },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'users' }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const CronJobModel = model<ICronJob>('CronJob', cronJobSchema);

// --- CronJobHistory Model ---

export interface ICronJobHistory extends Document {
  cronJobId: Types.ObjectId;
  runAt: Date;
  durationMs: number;
  status: 'SUCCESS' | 'FAILURE';
  error?: string;
  metadata?: Record<string, any>;
}

const cronJobHistorySchema = new Schema<ICronJobHistory>(
  {
    cronJobId: { type: Schema.Types.ObjectId, ref: 'CronJob', required: true, index: true },
    runAt: { type: Date, default: Date.now, index: true },
    durationMs: { type: Number },
    status: { type: String, enum: ['SUCCESS', 'FAILURE'], required: true },
    error: { type: String },
    metadata: { type: Schema.Types.Mixed }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const CronJobHistoryModel = model<ICronJobHistory>('CronJobHistory', cronJobHistorySchema);
