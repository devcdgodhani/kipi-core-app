import { ObjectId } from "mongoose";

export interface IApiResponse<T = undefined> {
  code: string;
  status: number;
  message: string;
  data?: T;
  error?: string | [] | object;
}
export interface IPaginationApiResponse<T> {
  code: string;
  status: number;
  message: string;
  data?: IPaginationData<T>;
  error?: string | [] | object;
}

export interface IPaginationData<T> {
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  currentPage: number;
  recordList?: T[];
}
export interface IDefaultAttributes {
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  createdBy?: ObjectId;
  updatedBy?: ObjectId;
  deletedBy?: ObjectId;
}

export interface IEnvVariables {
  NODE_ENV: 'local' | 'development' | 'production' | 'test';
  PORT: number;

  PG_DB_HOST: string;
  PG_DB_PORT: number;
  PG_DB_USER: string;
  PG_DB_PASSWORD: string;
  PG_DB_NAME: string;

  MONGO_DB_CONNECTION_URL: string;
  MONGO_DB_NAME?: string;

  JWT_SECRET: string;
  JWT_ACCESS_EXPIRATION_MINUTES: number;
  JWT_REFRESH_EXPIRATION_DAYS: number;
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: number;
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: number;

  LOG_FOLDER: string;
  LOG_FILE: string;
  LOG_LEVEL: string;

  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;

  META_CLIENT_ID: string;
  META_CLIENT_SECRET: string;

  APPLE_CLIENT_ID: string;
  APPLE_TEAM_ID: string;
  APPLE_KEY_ID: string;
  APPLE_PRIVATE_KEY: string;

  SERVER_URL: string;
  WEB_SERVER_URL: string;

  AWS_BUCKET_NAME: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;

  SMTP_SERVER: string;
  SMTP_EMAIL: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;

  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;

  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;

  CLOUD_TYPE?: string;
}

export interface IEmailOptions {
  from?: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string;
    path: string;
  }[];
}
