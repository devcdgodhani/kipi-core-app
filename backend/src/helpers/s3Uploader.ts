// src/utils/s3Uploader.ts
import fs from 'fs';
import path from 'path';
import { s3 } from '../configs/aws';
import { ENV_VARIABLE } from '../configs/env';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const uploadFileToS3 = async (
  localFilePath: string,
  s3Key: string,
  s3Bucket: string = ENV_VARIABLE.AWS_BUCKET_NAME,
): Promise<string> => {
  try {
    const fileContent = fs.readFileSync(localFilePath);
    const contentType = getMimeTypeFromExt(path.extname(localFilePath));

    const command = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
      // ACL: 'public-read', // ✅ For public access
    });
    await s3.send(command);

    // Delete local file after successful upload
    fs.unlinkSync(localFilePath);

    const filePath = `https://${s3Bucket}.s3.${ENV_VARIABLE.AWS_REGION}.amazonaws.com/${s3Key}`;
    return filePath;
  } catch (err) {
    fs.unlinkSync(localFilePath);
    throw err;
  }
};

export const getPresignedUrl = async (
  bucket: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fileStorage: any,
  expiresIn = 60 * 60 * 24,
): Promise<string> => {
  const s3Key = `${fileStorage.storagePath}/${fileStorage.storageFileName}`;

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: s3Key,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn }); // in seconds
  return signedUrl;
};

const getMimeTypeFromExt = (ext: string): string => {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
};
