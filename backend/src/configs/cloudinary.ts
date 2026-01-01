import { v2 as cloudinary } from 'cloudinary';
import { ENV_VARIABLE } from './env';

cloudinary.config({
  cloud_name: ENV_VARIABLE.CLOUDINARY_CLOUD_NAME,
  api_key: ENV_VARIABLE.CLOUDINARY_API_KEY,
  api_secret: ENV_VARIABLE.CLOUDINARY_API_SECRET,
});

export default cloudinary;
