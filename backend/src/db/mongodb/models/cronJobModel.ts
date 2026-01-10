import { Schema, model } from 'mongoose';
import { ICronJobDocument, ICronJobHistoryDocument, CRON_JOB_STATUS, CRON_JOB_LEVEL } from '../../../interfaces/cronJob';

const cronJobSchema = new Schema<ICronJobDocument>(
  {
    name: { type: String, required: true },
    identifier: { type: String, required: true, unique: true },
    description: { type: String },
    expression: { type: String, required: true },
    scheduleMinute: { type: String },
    scheduleHour: { type: String },
    scheduleDayOfMonth: { type: String },
    scheduleMonth: { type: String },
    scheduleDayOfWeek: { type: String },
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

export const CronJobModel = model<ICronJobDocument>('CronJob', cronJobSchema);

// --- CronJobHistory Model ---

const cronJobHistorySchema = new Schema<ICronJobHistoryDocument>(
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

export const CronJobHistoryModel = model<ICronJobHistoryDocument>('CronJobHistory', cronJobHistorySchema);
