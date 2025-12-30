import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadFileToS3 } from '../helpers/s3Uploader';
import { ApiError } from '../helpers/apiError';

// Ensure temp directory exists
const uploadDir = 'uploads/temp';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
    },
});

export const uploadMiddleware = upload.single('file');

export const UploadController = {
    uploadImage: async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                // throw new ApiError(400, 'No file uploaded');
                return res.status(400).json({ status: 400, message: 'No file uploaded', code: 'BAD_REQUEST' });
            }

            const localFilePath = req.file.path;
            const s3Key = `products/${req.file.filename}`;
            
            // Upload to S3 (this handles deletion of local file on success/fail)
            const fileUrl = await uploadFileToS3(localFilePath, s3Key);

            return res.status(200).json({
                status: 200,
                message: 'File uploaded successfully',
                data: {
                    url: fileUrl,
                    key: s3Key
                },
                code: 'SUCCESS'
            });

        } catch (error: any) {
            // Ensure local file is cleaned up if S3 upload throws specifically (though s3Uploader handles it, good to double check)
             if (req.file && fs.existsSync(req.file.path)) {
                 try { fs.unlinkSync(req.file.path); } catch (e) {}
             }
            
            console.error('Upload Error:', error);
            // new ApiError logic could be used here
            return res.status(500).json({ 
                status: 500, 
                message: error.message || 'File upload failed',
                code: 'INTERNAL_SERVER_ERROR'
            });
        }
    },

    // Standardized Placeholders
    getOne: async (req: Request, res: Response) => {
        return res.status(501).json({ status: 501, message: 'Not Implemented', code: 'NOT_IMPLEMENTED' });
    },
    getAll: async (req: Request, res: Response) => {
        return res.status(501).json({ status: 501, message: 'Not Implemented', code: 'NOT_IMPLEMENTED' });
    },
    getWithPagination: async (req: Request, res: Response) => {
        return res.status(501).json({ status: 501, message: 'Not Implemented', code: 'NOT_IMPLEMENTED' });
    },
    updateOneByFilter: async (req: Request, res: Response) => {
        return res.status(501).json({ status: 501, message: 'Not Implemented', code: 'NOT_IMPLEMENTED' });
    },
    updateManyByFilter: async (req: Request, res: Response) => {
        return res.status(501).json({ status: 501, message: 'Not Implemented', code: 'NOT_IMPLEMENTED' });
    },
    bulkCreate: async (req: Request, res: Response) => {
        return res.status(501).json({ status: 501, message: 'Not Implemented', code: 'NOT_IMPLEMENTED' });
    },
    deleteByFilter: async (req: Request, res: Response) => {
        return res.status(501).json({ status: 501, message: 'Not Implemented', code: 'NOT_IMPLEMENTED' });
    }
};
