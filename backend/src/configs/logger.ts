import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { ENV_VARIABLE } from '../configs/env';

// Ensure log folder exists
const logDir = path.resolve(process.cwd(), ENV_VARIABLE.LOG_FOLDER || 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const enumerateErrorFormat = winston.format((info: any) => {
    if (info.message instanceof Error) {
        info.message = {
            message: info.message.message,
            stack: info.message.stack,
            ...info.message,
        };
    }

    if (info instanceof Error) {
        return {
            // message: info.message,
            stack: info.stack,
            ...info,
        };
    }

    return info;
});
const transport = new DailyRotateFile({
    filename: path.join(logDir, '%DATE%-' + (ENV_VARIABLE.LOG_FILE || 'app.log')),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '3',
    // prepend: true,
});

export const logger = winston.createLogger({
    format: winston.format.combine(enumerateErrorFormat(), winston.format.json()),
    transports: [
        transport,
        new winston.transports.Console({
            level: 'info',
        }),
    ],
});
