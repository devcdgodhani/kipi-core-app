import { z } from 'zod';
import * as dotenv from 'dotenv';
import { IEnvVariables } from '../interfaces';

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['local', 'development', 'production', 'test']),
    PORT: z.coerce.number().default(3000),

    PG_DB_PORT: z.coerce.number().default(5432),
    PG_DB_HOST: z.string(),
    PG_DB_USER: z.string(),
    PG_DB_PASSWORD: z.string(),
    PG_DB_NAME: z.string(),

    MONGO_DB_CONNECTION_URL: z.string(),
    MONGO_DB_NAME: z.string().optional(),

    JWT_SECRET: z.string(),
    JWT_ACCESS_EXPIRATION_MINUTES: z.coerce.number().default(30),
    JWT_REFRESH_EXPIRATION_DAYS: z.coerce.number().default(30),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: z.coerce.number().default(10),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: z.coerce.number().default(10),

    LOG_FOLDER: z.string(),
    LOG_FILE: z.string(),
    LOG_LEVEL: z.string(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),

    META_CLIENT_ID: z.string(),
    META_CLIENT_SECRET: z.string(),

    APPLE_CLIENT_ID: z.string(),
    APPLE_TEAM_ID: z.string(),
    APPLE_KEY_ID: z.string(),
    APPLE_PRIVATE_KEY: z.string(),

    SERVER_URL: z.string(),
    WEB_SERVER_URL: z.string(),

    AWS_BUCKET_NAME: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_REGION: z.string(),

    SMTP_SERVER: z.string(),
    SMTP_EMAIL: z.string(),
    SMTP_PORT: z.coerce.number(),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),

    FIREBASE_PROJECT_ID: z.string(),
    FIREBASE_CLIENT_EMAIL: z.string(),
    FIREBASE_PRIVATE_KEY: z.string(),
  })
  .passthrough();

const result = envSchema.safeParse(process.env);

if (!result.success) {
  throw new Error(`Config validation error: ${result.error.message}`);
}

const value = result.data;

export const ENV_VARIABLE: IEnvVariables = {
  NODE_ENV: value.NODE_ENV,
  PORT: value.PORT,

  PG_DB_HOST: value.PG_DB_HOST,
  PG_DB_PORT: value.PG_DB_PORT,
  PG_DB_USER: value.PG_DB_USER,
  PG_DB_PASSWORD: value.PG_DB_PASSWORD,
  PG_DB_NAME: value.PG_DB_NAME,

  MONGO_DB_CONNECTION_URL: value.MONGO_DB_CONNECTION_URL,
  MONGO_DB_NAME: value.MONGO_DB_NAME as string,

  JWT_SECRET: value.JWT_SECRET,
  JWT_ACCESS_EXPIRATION_MINUTES: value.JWT_ACCESS_EXPIRATION_MINUTES,
  JWT_REFRESH_EXPIRATION_DAYS: value.JWT_REFRESH_EXPIRATION_DAYS,
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: value.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: value.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,

  LOG_FOLDER: value.LOG_FOLDER,
  LOG_FILE: value.LOG_FILE,
  LOG_LEVEL: value.LOG_LEVEL,

  GOOGLE_CLIENT_ID: value.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: value.GOOGLE_CLIENT_SECRET,

  META_CLIENT_ID: value.META_CLIENT_ID,
  META_CLIENT_SECRET: value.META_CLIENT_SECRET,

  APPLE_CLIENT_ID: value.APPLE_CLIENT_ID,
  APPLE_TEAM_ID: value.APPLE_TEAM_ID,
  APPLE_KEY_ID: value.APPLE_KEY_ID,
  APPLE_PRIVATE_KEY: value.APPLE_PRIVATE_KEY,

  SERVER_URL: value.SERVER_URL,
  WEB_SERVER_URL: value.WEB_SERVER_URL,

  AWS_BUCKET_NAME: value.AWS_BUCKET_NAME,
  AWS_ACCESS_KEY_ID: value.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: value.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: value.AWS_REGION,

  SMTP_SERVER: value.SMTP_SERVER,
  SMTP_EMAIL: value.SMTP_EMAIL,
  SMTP_PORT: value.SMTP_PORT,
  SMTP_USER: value.SMTP_USER,
  SMTP_PASS: value.SMTP_PASS,

  FIREBASE_PROJECT_ID: value.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: value.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: value.FIREBASE_PRIVATE_KEY,
};
