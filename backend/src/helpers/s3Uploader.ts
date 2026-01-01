// src/helpers/s3Uploader.ts
import fs from 'fs';
import path from 'path';
import { s3 } from '../configs/aws';
import { ENV_VARIABLE } from '../configs/env';
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getAwsSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Creates a folder in S3 (0-byte object with trailing slash).
 */
export const createFolder = async (
  folderPath: string,
  bucket: string = ENV_VARIABLE.AWS_BUCKET_NAME
): Promise<void> => {
  const key = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: '',
  });
  await s3.send(command);
};

/**
 * Copies a file in S3.
 */
export const copyFile = async (
  sourceKey: string,
  destKey: string,
  bucket: string = ENV_VARIABLE.AWS_BUCKET_NAME
): Promise<void> => {
  const command = new CopyObjectCommand({
    Bucket: bucket,
    CopySource: `${bucket}/${sourceKey}`,
    Key: destKey,
  });
  await s3.send(command);
};

/**
 * Uploads a file to S3 and returns the secure URL.
 * 
 * @param localFilePath Path to the local file
 * @param key S3 Key (path/filename)
 * @param bucket Optional bucket name
 * @returns Promise<string> URL of the uploaded file
 */
export const uploadFile = async (
  localFilePath: string,
  key: string,
  bucket: string = ENV_VARIABLE.AWS_BUCKET_NAME,
): Promise<string> => {
  try {
    const fileContent = fs.readFileSync(localFilePath);
    const contentType = getMimeTypeFromExt(path.extname(localFilePath));

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    });
    await s3.send(command);

    // Delete local file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    const filePath = `https://${bucket}.s3.${ENV_VARIABLE.AWS_REGION}.amazonaws.com/${key}`;
    return filePath;
  } catch (err) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw err;
  }
};

/**
 * Deletes a file from S3.
 * 
 * @param key S3 Key
 * @param bucket Optional bucket name
 */
export const deleteFile = async (
  key: string,
  bucket: string = ENV_VARIABLE.AWS_BUCKET_NAME
): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await s3.send(command);
  } catch (err) {
    throw err;
  }
};

/**
 * Generates a signed URL for an S3 asset.
 * 
 * @param key S3 Key
 * @param bucket Optional bucket name
 * @param expiresIn Expiration time in seconds
 * @returns Promise<string> Signed URL
 */
export const getSignedUrl = async (
  key: string,
  bucket: string = ENV_VARIABLE.AWS_BUCKET_NAME,
  expiresIn = 60 * 60 * 24,
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getAwsSignedUrl(s3, command, { expiresIn });
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
