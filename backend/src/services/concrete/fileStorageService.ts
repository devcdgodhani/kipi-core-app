import { FilterQuery, PopulateOptions, QueryOptions, ProjectionType } from 'mongoose';
import { FileStorageModel, PresignedUrlModel } from '../../db/mongodb';
import { IFileStorageAttributes, IFileStorageDocument, IPresignedUrlDocument, IPaginationData } from '../../interfaces';
import { IFileStorageService } from '../contracts/fileStorageServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { CLOUD_TYPE, FILE_TYPE, FILE_STORAGE_STATUS } from '../../constants';
import { ENV_VARIABLE } from '../../configs/env';
import * as s3Uploader from '../../helpers/s3Uploader';
import * as cloudinaryUploader from '../../helpers/cloudinaryUploader';
import path from 'path';

export class FileStorageService
  extends MongooseCommonService<IFileStorageAttributes, IFileStorageDocument>
  implements IFileStorageService
{
  constructor() {
    super(FileStorageModel);
  }

  // Helper to determine file type from extension
  private getFileType(extension: string): FILE_TYPE {
    const ext = extension.toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) return FILE_TYPE.IMAGE;
    if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) return FILE_TYPE.VIDEO;
    if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) return FILE_TYPE.AUDIO;
    if (['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'].includes(ext)) return FILE_TYPE.DOCUMENT;
    return FILE_TYPE.OTHER;
  }

  // Helper to get uploader based on env/cloud type
  private getUploader(cloudType: CLOUD_TYPE) {
    if (cloudType === CLOUD_TYPE.AWS_S3) return s3Uploader;
    return cloudinaryUploader;
  }

  // Override findOne to populate presigned URL
  findOne = async (
    filter: FilterQuery<IFileStorageAttributes>,
    options: QueryOptions = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<IFileStorageAttributes | null> => {
    const query = this.model.findOne(filter, null, options);
    if (populate) query.populate(populate);
    const doc = await query.lean<IFileStorageAttributes>().exec();
    
    if (doc) {
      await this.ensurePresignedUrl(doc);
    }
    return doc;
  };

  // Override findAll to populate presigned URL
  findAll = async (
    filter: FilterQuery<IFileStorageAttributes>,
    options: QueryOptions = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<IFileStorageAttributes[]> => {
    const query = this.model.find(filter, null, options);
    if (populate) query.populate(populate);
    const docs = await query.lean<IFileStorageAttributes[]>().exec();
    
    await Promise.all(docs.map(doc => this.ensurePresignedUrl(doc)));
    return docs;
  };

  findAllWithPagination = async (
    filter: FilterQuery<IFileStorageAttributes>,
    options: QueryOptions & {
      page?: number;
      limit?: number;
      order?: Partial<Record<keyof IFileStorageAttributes, 1 | -1>>;
      projection?: ProjectionType<IFileStorageAttributes>;
    } = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<IPaginationData<IFileStorageAttributes>> => {
    const { order, projection, page = 1, limit = 10, ...restOptions } = options;

    const sort = order || { updatedAt: -1 };
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const totalRecords = await this.model.countDocuments(filter).exec();
    const totalPages = Math.ceil(totalRecords / safeLimit);

    const query = this.model.find(filter, projection, {
      ...restOptions,
      limit: safeLimit,
      skip,
      sort,
    });

    if (populate) query.populate(populate);

    const recordList = await query.lean<IFileStorageAttributes[]>().exec();

    if (recordList && Array.isArray(recordList)) {
       await Promise.all(recordList.map((doc) => this.ensurePresignedUrl(doc)));
    }

    return {
      limit: safeLimit,
      totalRecords,
      totalPages,
      hasPreviousPage: safePage > 1,
      currentPage: page,
      hasNextPage: safePage < totalPages,
      recordList,
    };
  };

  async ensurePresignedUrl(doc: IFileStorageAttributes): Promise<void> {
    // Check if active presigned url exists
    // We need to cast _id because in lean objects it might be object or string, but typically ObjectId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let presignedUrlDoc = await PresignedUrlModel.findOne({ fileId: (doc as any)._id });

    if (!presignedUrlDoc) {
      // Generate new one
      const url = await this.generatePresignedUrl(doc._id.toString());
      doc.preSignedUrl = url;
    } else {
      doc.preSignedUrl = presignedUrlDoc.url;
    }
  }

  async generatePresignedUrl(fileId: string, expiryTime: number = 60 * 60): Promise<string> {
    const file = await this.model.findById(fileId);
    if (!file) throw new Error('File not found');

    const uploader = this.getUploader(file.cloudType);
    const key = file.storageDirPath 
      ? `${file.storageDirPath}/${file.storageFileName}`
      : file.storageFileName;

    // Call uploader.getSignedUrl (types adjusted via any cast if needed/implied by TS)
    const signedUrl = await uploader.getSignedUrl(key, undefined, expiryTime);

    // Create PresignedUrl record with TTL
    const expiresAt = new Date(Date.now() + expiryTime * 1000);

    await PresignedUrlModel.create({
      fileId: file._id,
      url: signedUrl,
      expiresAt: expiresAt,
    });

    return signedUrl;
  }

  async cleanExpiredPresignedUrls(): Promise<void> {
    // MongoDB TTL index handles this automatically!
    return; 
  }

  async uploadFiles(files: any[], storageDirPath?: string): Promise<IFileStorageAttributes[]> {
    const uploadedDocs: IFileStorageAttributes[] = [];
    
    let cloudType = CLOUD_TYPE.CLOUDINARY;

    if (ENV_VARIABLE.CLOUD_TYPE) {
      if (ENV_VARIABLE.CLOUD_TYPE === CLOUD_TYPE.CLOUDINARY) {
        cloudType = CLOUD_TYPE.CLOUDINARY;
      } else if (ENV_VARIABLE.CLOUD_TYPE === CLOUD_TYPE.AWS_S3) {
        cloudType = CLOUD_TYPE.AWS_S3;
      }
    }

    const uploader = this.getUploader(cloudType);
    const bucket = ENV_VARIABLE.AWS_BUCKET_NAME;

    for (const file of files) {
      const ext = path.extname(file.originalname);
      // const originalName = path.basename(file.originalname, ext);
      const storageFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const key = storageDirPath ? `${storageDirPath}/${storageFileName}` : storageFileName;

      // Upload
      // file.path matches multer's output
      await uploader.uploadFile(file.path, key, bucket);

      // Create DB Record
      const newFile = await this.create({
        originalFileName: file.originalname,
        storageFileName: storageFileName,
        storageDirPath: storageDirPath,
        fileSize: file.size,
        fileExtension: ext,
        fileType: this.getFileType(ext),
        cloudType: cloudType,
        status: FILE_STORAGE_STATUS.ACTIVE,
        isInUsed: false,
      } as any);

      uploadedDocs.push(newFile);
    }
    
    return uploadedDocs;
  }
}
