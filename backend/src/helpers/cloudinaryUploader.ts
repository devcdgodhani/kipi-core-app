import fs from 'fs';
import cloudinary from '../configs/cloudinary';

/**
 * Uploads a file to Cloudinary and returns the secure URL.
 * 
 * @param localFilePath Path to the local file
 * @param key Folder/PublicID path (mapped to Cloudinary folder/public_id)
 * @returns Promise<string> Secure URL of the uploaded file
 */
export const uploadFile = async (
  localFilePath: string,
  key: string,
  _bucket?: string,
): Promise<string> => {
  try {
    const lastSlashIndex = key.lastIndexOf('.');
    const ext = lastSlashIndex > -1 ? key.substring(lastSlashIndex + 1) : undefined;
    const baseKey = lastSlashIndex > -1 ? key.substring(0, lastSlashIndex) : key;

    // Further split baseKey into folder and publicId for the uploader
    const folderSlashIndex = baseKey.lastIndexOf('/');
    const folder = folderSlashIndex > -1 ? baseKey.substring(0, folderSlashIndex) : undefined;
    const publicId = folderSlashIndex > -1 ? baseKey.substring(folderSlashIndex + 1) : baseKey;

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folder,
      public_id: publicId,
      resource_type: 'auto',
      type: 'authenticated',
      format: ext
    });

    // Delete local file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return result.secure_url;
  } catch (err) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw err;
  }
};

export const createFolder = async (folderPath: string) => {
  await cloudinary.api.create_folder(folderPath);
};

export const renameFile = async (fromPublicId: string, toPublicId: string) => {
  await cloudinary.uploader.rename(fromPublicId, toPublicId, {
    type: 'authenticated'
  });
};

/**
 * Deletes a file from Cloudinary.
 * 
 * @param key Cloudinary public ID
 */
export const deleteFile = async (
  key: string,
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(key, {
      resource_type: 'image', // Default to image, though auto would be better if we tracked it
      type: 'authenticated'
    });
  } catch (err) {
    throw err;
  }
};

/**
 * Generates a signed URL for a private Cloudinary asset.
 * 
 * @param key Cloudinary public ID
 * @returns Promise<string> Signed URL
 */
export const getSignedUrl = async (
  key: string,
  _bucket?: string,
  _expiresIn?: number,
  resourceType: string = 'image'
): Promise<string> => {
  const lastDotIndex = key.lastIndexOf('.');
  const publicId = lastDotIndex > -1 ? key.substring(0, lastDotIndex) : key;
  const format = lastDotIndex > -1 ? key.substring(lastDotIndex + 1) : undefined;

  const expiresAt = Math.floor(Date.now() / 1000) + (_expiresIn || 3600);

  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    type: 'authenticated',
    resource_type: resourceType,
    format: format,
    expires_at: expiresAt
  });
};
