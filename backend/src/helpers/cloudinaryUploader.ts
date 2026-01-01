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
    // Split key into folder and publicId if possible
    const lastSlashIndex = key.lastIndexOf('/');
    const folder = lastSlashIndex > -1 ? key.substring(0, lastSlashIndex) : 'uploads';
    const publicId = lastSlashIndex > -1 ? key.substring(lastSlashIndex + 1) : key;

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folder,
      public_id: publicId,
      resource_type: 'auto',
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
  _expiresIn?: number
): Promise<string> => {
  return cloudinary.url(key, {
    secure: true,
    sign_url: true,
    type: 'authenticated'
  });
};
