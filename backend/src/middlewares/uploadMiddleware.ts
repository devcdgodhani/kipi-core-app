import multer from 'multer';
import { Request } from 'express';
import { FILE_TYPE } from '../constants';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Prevent executable files
  const forbiddenExtensions = ['.exe', '.sh', '.bat', '.cmd', '.apk', '.jar', '.msi'];
  const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  
  if (forbiddenExtensions.includes(ext)) {
    return cb(new Error('Executable files are not allowed!'));
  }
  
  cb(null, true);
};

export const uploadMiddleware = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  }
});
