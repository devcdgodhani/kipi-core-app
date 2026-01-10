import { Document, Types } from 'mongoose';
import { IDefaultAttributes } from './common';

export enum CRON_JOB_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PAUSED = 'PAUSED'
}

export enum CRON_JOB_LEVEL {
  SYSTEM = 'SYSTEM',
  USER = 'USER'
}

export type CronJobResult = 'SUCCESS' | 'FAILURE';

export interface ICronJobAttributes extends IDefaultAttributes {
  name: string;
  identifier: string;
  description?: string;
  expression: string;
  scheduleMinute?: string;
  scheduleHour?: string;
  scheduleDayOfMonth?: string;
  scheduleMonth?: string;
  scheduleDayOfWeek?: string;
  status: CRON_JOB_STATUS;
  level: CRON_JOB_LEVEL;
  lastRun?: Date;
  nextRun?: Date;
  lastResult?: CronJobResult;
  lastError?: string;
  config?: Record<string, any>;
}

export interface ICronJobDocument extends Omit<ICronJobAttributes, '_id'>, Document {}

// CronJobHistory interface
export interface ICronJobHistoryAttributes {
  cronJobId: Types.ObjectId;
  runAt: Date;
  durationMs: number;
  status: CronJobResult;
  error?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICronJobHistoryDocument extends ICronJobHistoryAttributes, Document {}
