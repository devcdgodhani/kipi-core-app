import { FilterQuery, PopulateOptions, QueryOptions, ProjectionType } from 'mongoose';
import { FileStorageModel, PresignedUrlModel, FileDirectoryModel } from '../../db/mongodb';
import { IFileStorageAttributes, IFileStorageDocument, IPresignedUrlDocument, IPaginationData, IFileDirectoryDocument, IFileDirectoryAttributes } from '../../interfaces';
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

  findAll = async (
    filter: FilterQuery<IFileStorageAttributes>,
    options: QueryOptions = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<IFileStorageAttributes[]> => {
    // Handle Root Directory Filter from file perspective
    if (filter.storageDirPath === '') {
        delete filter.storageDirPath;
        filter.$or = [
            { storageDirPath: '' },
            { storageDirPath: null },
            { storageDirPath: { $exists: false } }
        ];
    }
    
    const query = this.model.find(filter, null, options);
    if (populate) query.populate(populate);
    const docs = await query.lean<IFileStorageAttributes[]>().exec();
    
    await Promise.all(docs.map(doc => this.ensurePresignedUrl(doc)));
    return docs;
  };

  async getFilesAndFolders(
    filter: FilterQuery<IFileStorageAttributes>,
    options: QueryOptions = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<{ dirList: IFileDirectoryAttributes[], fileList: IFileStorageAttributes[] }> {
     let storageDirPath: any | null | undefined = null;

     const fileFilter = { ...filter };
     
    // Handle storageDir
    if (fileFilter.storageDirPath === undefined) {
             storageDirPath = null;
             delete fileFilter.storageDirPath;
             // Root filter for files: check both storageDir and storageDirPath for backward compat
             fileFilter.$or = [
                 { storageDirPath: '' },
                 { storageDirPath: null },
                 { storageDirPath: { $exists: false } },
               
             ];
        
    }  else {
             storageDirPath = fileFilter.storageDirPath as string;
         }
    // Fetch Files
    const query = this.model.find(fileFilter, null, options);
    if (populate) query.populate(populate);
    const docs = await query.lean<IFileStorageAttributes[]>().exec();

    // Fetch Directories
    const mappedDirs = await FileDirectoryModel.find({ parentPath: storageDirPath ? storageDirPath.$in.pop() : null}).lean()
    
    await Promise.all(docs.map(doc => this.ensurePresignedUrl(doc)));
    
    return {
        dirList: mappedDirs,
        fileList: docs
    };
  }

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
    // Handle Root Directory Filter
    if (filter.storageDirPath === '') {
        delete filter.storageDirPath;
        filter.$or = [
            { storageDirPath: '' },
            { storageDirPath: null },
            { storageDirPath: { $exists: false } }
        ];
    }

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

    const signedUrl = await uploader.getSignedUrl(key, undefined, expiryTime);

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

  private joinPath(dir: string | null | undefined, fileName: string): string {
    if (!dir) return fileName;
    const cleanDir = dir.split('/').filter(p => p).join('/');
    return cleanDir ? `${cleanDir}/${fileName}` : fileName;
  }

  private async createCloudFolderHelper(fullPath: string) {
    let cloudType = CLOUD_TYPE.AWS_S3;

    if (ENV_VARIABLE.CLOUD_TYPE) {
      if (ENV_VARIABLE.CLOUD_TYPE === 'CLOUDINARY') {
        cloudType = CLOUD_TYPE.CLOUDINARY;
      } else if (ENV_VARIABLE.CLOUD_TYPE === 'AWS_S3') {
        cloudType = CLOUD_TYPE.AWS_S3;
      }
    } else if (!ENV_VARIABLE.AWS_ACCESS_KEY_ID && ENV_VARIABLE.CLOUDINARY_CLOUD_NAME) {
      cloudType = CLOUD_TYPE.CLOUDINARY;
    } 

    const uploader = this.getUploader(cloudType);
    
    if (cloudType === CLOUD_TYPE.AWS_S3) {
      await (uploader as any).createFolder(fullPath, ENV_VARIABLE.AWS_BUCKET_NAME);
    } else {
      await (uploader as any).createFolder(fullPath);
    }
  }

  async ensureDirectoryHierarchy(dirPath: string): Promise<void> {
    if (!dirPath) return;
    const parts = dirPath.split('/').filter(p => p); 
    let currentPath = '';

    for (const part of parts) {
       const parentPath = currentPath ? path.basename(currentPath) : null;
       currentPath = currentPath ? `${currentPath}/${part}` : part;
       
       const existing = await FileDirectoryModel.findOne({ path: currentPath });
       if (!existing) {
           await FileDirectoryModel.create({
               name: part,
               path: currentPath,
               parentPath: parentPath,
           });
           await this.createCloudFolderHelper(currentPath);
       }
    }
  }

  async uploadFiles(files: any[], data: any): Promise<IFileStorageAttributes[]> {
    const { storageDirPath, storageDir } = data;
    const uploadedDocs: IFileStorageAttributes[] = [];
    
    // Ensure hierarchy exists if path provided
    if (storageDirPath) {
        await this.ensureDirectoryHierarchy(storageDirPath);
    }

    let cloudType = CLOUD_TYPE.CLOUDINARY;

    if (ENV_VARIABLE.CLOUD_TYPE) {
      if (ENV_VARIABLE.CLOUD_TYPE === CLOUD_TYPE.CLOUDINARY) {
        cloudType = CLOUD_TYPE.CLOUDINARY;
      } else if (ENV_VARIABLE.CLOUD_TYPE === CLOUD_TYPE.AWS_S3) {
        cloudType = CLOUD_TYPE.AWS_S3;
      }
    } else if (!ENV_VARIABLE.AWS_ACCESS_KEY_ID && ENV_VARIABLE.CLOUDINARY_CLOUD_NAME) {
      cloudType = CLOUD_TYPE.CLOUDINARY;
    }
    
    // Default fallback
    cloudType = cloudType || CLOUD_TYPE.AWS_S3;

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
        storageDirPath: storageDirPath || null, // Ensure explicit null if undefined/empty
        storageDir: storageDir || (storageDirPath ? path.basename(storageDirPath) : null), // Use provided, or derive, or null
        fileSize: file.size,
        fileExtension: ext,
        fileType: this.getFileType(ext),
        cloudType: cloudType,
        status: FILE_STORAGE_STATUS.ACTIVE,
        isInUsed: false,
      } as any);

      uploadedDocs.push(newFile);
    }

    await Promise.all(uploadedDocs.map(doc => this.ensurePresignedUrl(doc)));
    
    return uploadedDocs;
  }

  async createFolder(name: string, storageDirPath?: string): Promise<IFileStorageAttributes> {
    const fullPath = storageDirPath ? `${storageDirPath}/${name}` : name;
    
    // Check if exists
    const existing = await FileDirectoryModel.findOne({ path: fullPath });
    if(existing) throw new Error('Folder already exists');

    // Cloud creation
    await this.createCloudFolderHelper(fullPath);

    // DB Creation
    const dir = await FileDirectoryModel.create({
      name, 
      path: fullPath, 
      parentPath: storageDirPath ? path.basename(storageDirPath) : null 
    });
    
    // Return mapped to IFileStorageAttributes
    return {
       _id: dir._id,
       originalFileName: dir.name,
       storageFileName: dir.name,
       storageDirPath: dir.parentPath || undefined,
       storageDir: dir.parentPath || undefined,
       fileType: FILE_TYPE.DIRECTORY,
       cloudType: CLOUD_TYPE.AWS_S3, 
       status: FILE_STORAGE_STATUS.ACTIVE,
       isInUsed: false,
       createdAt: dir.createdAt,
       updatedAt: dir.updatedAt,
    } as any;
  }

  async moveFile(fileId: string, newStorageDirPath: string): Promise<IFileStorageAttributes> {
    const file = await this.model.findById(fileId);
    if (!file) throw new Error('File not found');

    const cleanNewPath = newStorageDirPath ? newStorageDirPath.split('/').filter(p => p).join('/') : '';

    if (cleanNewPath) {
        await this.ensureDirectoryHierarchy(cleanNewPath);
    }

    const uploader = this.getUploader(file.cloudType);

    const oldKey = this.joinPath(file.storageDirPath, file.storageFileName);
    const newKey = this.joinPath(cleanNewPath, file.storageFileName);

    console.log(`Moving file from [${oldKey}] to [${newKey}]`);

    // Cloud move
    if (file.cloudType === CLOUD_TYPE.AWS_S3) {
      await (uploader as any).copyFile(oldKey, newKey, ENV_VARIABLE.AWS_BUCKET_NAME);
      await (uploader as any).deleteFile(oldKey, ENV_VARIABLE.AWS_BUCKET_NAME);
    } else {
      await (uploader as any).renameFile(oldKey, newKey);
    }

    // Determine storageDir (base folder name)
    const storageDir = cleanNewPath ? path.basename(cleanNewPath) : null;

    // Update DB Record while preserving ID
    const updatedFile = await this.model.findByIdAndUpdate(
      file._id,
      {
        $set: {
          storageDirPath: cleanNewPath || null,
          storageDir: storageDir,
        },
      },
      { new: true }
    );

    if (!updatedFile) throw new Error('Failed to update file record');
    
    await this.ensurePresignedUrl(updatedFile);
    return updatedFile;
  }

  // --- Deletion Logic for Directories and Files (Override softDelete) ---

  private async performHardDeleteFile(file: IFileStorageDocument | any) {
    const uploader = this.getUploader(file.cloudType);
    const key = this.joinPath(file.storageDirPath, file.storageFileName);
    
    try {
        if (file.cloudType === CLOUD_TYPE.AWS_S3) {
           await (uploader as any).deleteFile(key, ENV_VARIABLE.AWS_BUCKET_NAME);
        } else {
           await (uploader as any).deleteFile(key);
        }
    } catch (e) {
        console.error("Cloud delete error", e);
    }

    await PresignedUrlModel.deleteOne({ fileId: file._id });
    await this.model.deleteOne({ _id: file._id });
  }

  private async deleteCloudFolderHelper(path: string) {
      let cloudType = CLOUD_TYPE.AWS_S3;
      if (ENV_VARIABLE.CLOUD_TYPE) {
        if (ENV_VARIABLE.CLOUD_TYPE === 'CLOUDINARY') {
          cloudType = CLOUD_TYPE.CLOUDINARY;
        } else if (ENV_VARIABLE.CLOUD_TYPE === 'AWS_S3') {
          cloudType = CLOUD_TYPE.AWS_S3;
        }
      } else if (!ENV_VARIABLE.AWS_ACCESS_KEY_ID && ENV_VARIABLE.CLOUDINARY_CLOUD_NAME) {
        cloudType = CLOUD_TYPE.CLOUDINARY;
      }

      const uploader = this.getUploader(cloudType);
      try {
           if (cloudType === CLOUD_TYPE.AWS_S3) {
             await (uploader as any).deleteFolder(path, ENV_VARIABLE.AWS_BUCKET_NAME);
          } else {
             await (uploader as any).deleteFolder(path);
          }
      } catch (e) {
          console.error("Cloud folder delete error", e);
      }
  }

  private async deleteDirectoryRecursively(dirPath: string) {
      // 1. Files in this dir
      const files = await this.model.find({ storageDirPath: dirPath });
      for (const file of files) {
          await this.performHardDeleteFile(file);
      }

      // 2. Subdirectories
      const subDirs = await FileDirectoryModel.find({ 
          parentPath: path.basename(dirPath),
          path: { $regex: new RegExp('^' + dirPath + '/') }
      });
      for (const subDir of subDirs) {
          await this.deleteDirectoryRecursively(subDir.path);
          await FileDirectoryModel.deleteOne({ _id: subDir._id });
          await this.deleteCloudFolderHelper(subDir.path);
      }
  }

  softDelete = async (filter: FilterQuery<IFileStorageAttributes>, options?: any): Promise<any> => {
      // 1. Try to find File first
      const file = await this.model.findOne(filter);
      if (file) {
          // Perform Hard Delete as requested for cleanup
          await this.performHardDeleteFile(file);
          return { acknowledged: true, modifiedCount: 1, upsertedId: null, upsertedCount: 0, matchedCount: 1 };
      }
      
      // 2. Try to find Directory
      const id = filter._id || filter.id || (filter as any)._id; // Check different forms
      if (id) { 
          const dir = await FileDirectoryModel.findById(id);
          if (dir) {
              await this.deleteDirectoryRecursively(dir.path);
              await FileDirectoryModel.deleteOne({ _id: dir._id });
              await this.deleteCloudFolderHelper(dir.path);
              return { acknowledged: true, modifiedCount: 1, upsertedId: null, upsertedCount: 0, matchedCount: 1 };
          }
      }
      
      return { acknowledged: true, modifiedCount: 0, upsertedId: null, upsertedCount: 0, matchedCount: 0 };
  }
}
