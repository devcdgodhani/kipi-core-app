import { S3Client } from '@aws-sdk/client-s3';
import { ENV_VARIABLE } from './env';

export const s3 = new S3Client({
    region: ENV_VARIABLE.AWS_REGION,
    credentials: {
        accessKeyId: ENV_VARIABLE.AWS_ACCESS_KEY_ID!,
        secretAccessKey: ENV_VARIABLE.AWS_SECRET_ACCESS_KEY!,
    },
});
