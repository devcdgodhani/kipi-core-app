import { FilterQuery, PopulateOptions, QueryOptions, ProjectionType } from 'mongoose';
import { FileStorageModel } from '../../db/mongodb';
import { IFileStorageAttributes, IFileStorageDocument, IPaginationData, IFileDirectoryAttributes } from '../../interfaces';
import { IFileStorageService } from '../contracts/fileStorageServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { CLOUD_TYPE, FILE_TYPE, FILE_STORAGE_STATUS } from '../../constants';
import { ENV_VARIABLE } from '../../configs/env';
import * as s3Uploader from '../../helpers/s3Uploader';
import * as cloudinaryUploader from '../../helpers/cloudinaryUploader';
import path from 'path';
import { fileDirectoryService } from './fileDirectoryService';
import { presignedUrlService } from './presignedUrlService';
 
export class FileStorageService
  extends MongooseCommonService<IFileStorageAttributes, IFileStorageDocument>
  implements IFileStorageService
{
  private get fileDirectoryService() { return fileDirectoryService; }
  private get presignedUrlService() { return presignedUrlService; }
  
  constructor() {
    super(FileStorageModel as any);
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

  private getCloudinaryResourceType(fileType: FILE_TYPE): string {
    switch (fileType) {
      case FILE_TYPE.IMAGE: return 'image';
      case FILE_TYPE.VIDEO: return 'video';
      case FILE_TYPE.AUDIO: return 'video'; // Cloudinary treats audio as video resource type
      default: return 'raw';
    }
  }

  // Helper to get uploader based on env/cloud type
  private getUploader(cloudType: CLOUD_TYPE) {
    if (cloudType === CLOUD_TYPE.AWS_S3) return s3Uploader;
    return cloudinaryUploader;
  }

  // Override findOne to populate presigned URL
  async findOne(
    filter: FilterQuery<IFileStorageAttributes>,
    options: QueryOptions = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<IFileStorageAttributes | null> {
    const doc = await super.findOne(filter, options, populate);
    
    if (doc) {
      await this.ensurePresignedUrl(doc);
    }
    return doc;
  }

  async findAll(
    filter: FilterQuery<IFileStorageAttributes>,
    options: QueryOptions = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<IFileStorageAttributes[]> {
    // Handle Root Directory Filter from file perspective
    const effectiveFilter = { ...filter };
    if (effectiveFilter.storageDirPath === '') {
        delete effectiveFilter.storageDirPath;
        effectiveFilter.$or = [
            { storageDirPath: '' },
            { storageDirPath: null },
            { storageDirPath: { $exists: false } }
        ] as any;
    }
    
    const docs = await super.findAll(effectiveFilter as any, options, populate);
    
    await Promise.all(docs.map(doc => this.ensurePresignedUrl(doc)));
    return docs;
  }

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
    const docs = await super.findAll(fileFilter as any, options, populate);

    // Fetch Directories
    let dirParentPath: string | null = null;
    if (storageDirPath) {
        if (typeof storageDirPath === 'string') {
            dirParentPath = storageDirPath;
        } else if (Array.isArray(storageDirPath)) {
            dirParentPath = storageDirPath[0] || null;
        } else if (storageDirPath.$in && Array.isArray(storageDirPath.$in)) {
            dirParentPath = [...storageDirPath.$in].pop() || null;
        }
    }
    const mappedDirs = await this.fileDirectoryService.findAll({ parentPath: dirParentPath } as any);
    
    await Promise.all(docs.map(doc => this.ensurePresignedUrl(doc)));
    
    return {
        dirList: mappedDirs,
        fileList: docs
    };
  }

  async findAllWithPagination(
    filter: FilterQuery<IFileStorageAttributes>,
    options: QueryOptions & {
      page?: number;
      limit?: number;
      order?: Partial<Record<keyof IFileStorageAttributes, 1 | -1>>;
      projection?: ProjectionType<IFileStorageAttributes>;
    } = {},
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<IPaginationData<IFileStorageAttributes>> {
    // Handle Root Directory Filter
    const effectiveFilter = { ...filter };
    if (effectiveFilter.storageDirPath === '') {
        delete effectiveFilter.storageDirPath;
        effectiveFilter.$or = [
            { storageDirPath: '' },
            { storageDirPath: null },
            { storageDirPath: { $exists: false } }
        ] as any;
    }
 
    const result = await super.findAllWithPagination(effectiveFilter as any, options, populate);
 
    if (result.recordList && Array.isArray(result.recordList)) {
       await Promise.all(result.recordList.map((doc) => this.ensurePresignedUrl(doc)));
    }
 
    return result;
  }

  async ensurePresignedUrl(doc: IFileStorageAttributes): Promise<void> {
    // Check if active presigned url exists
    // We need to cast _id because in lean objects it might be object or string, but typically ObjectId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let presignedUrlDoc = await this.presignedUrlService.findOne({ fileId: (doc as any)._id } as any);

    if (!presignedUrlDoc) {
      // Generate new one
      const url = await this.generatePresignedUrl(doc._id.toString());
      doc.preSignedUrl = url;
    } else {
      doc.preSignedUrl = presignedUrlDoc.url;
    }
  }

  async generatePresignedUrl(fileId: string, expiryTime: number = 60 * 60): Promise<string> {
    const file = await this.findById(fileId);
    if (!file) throw new Error('File not found');

    const uploader = this.getUploader(file.cloudType);
    const key = file.storageDirPath 
      ? `${file.storageDirPath}/${file.storageFileName}`
      : file.storageFileName;
    
    const resourceType = file.cloudType === CLOUD_TYPE.CLOUDINARY 
      ? this.getCloudinaryResourceType(file.fileType) 
      : undefined;

    const signedUrl = await (uploader as any).getSignedUrl(key, undefined, expiryTime, resourceType);

    const expiresAt = new Date(Date.now() + expiryTime * 1000);

    await this.presignedUrlService.create({
      fileId: file._id,
      url: signedUrl,
      expiresAt: expiresAt,
    } as any);

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
        const parentPath = currentPath || null;
       currentPath = currentPath ? `${currentPath}/${part}` : part;
       
       const existing = await this.fileDirectoryService.findOne({ path: currentPath } as any);
       if (!existing) {
           await this.fileDirectoryService.create({
               name: part,
               path: currentPath,
               parentPath: parentPath,
           } as any);
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
    const existing = await this.fileDirectoryService.findOne({ path: fullPath } as any);
    if(existing) throw new Error('Folder already exists');

    // Cloud creation
    await this.createCloudFolderHelper(fullPath);

    // DB Creation
    const dir = await this.fileDirectoryService.create({
      name, 
      path: fullPath, 
      parentPath: storageDirPath ? storageDirPath : null 
    } as any);
    
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
    const file = await this.findById(fileId);
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
    const updatedFile = await this.updateOne(
      { _id: file._id } as any,
      {
        $set: {
          storageDirPath: cleanNewPath || null,
          storageDir: storageDir,
        },
      } as any
    );

    if (!updatedFile) throw new Error('Failed to update file record');
    
    // Refresh for the response
    const refreshedFile = await this.findById(file._id.toString());
    if (!refreshedFile) throw new Error('Failed to refresh file record');

    await this.ensurePresignedUrl(refreshedFile);
    return refreshedFile;
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

    await this.presignedUrlService.delete({ fileId: (file as any)._id } as any);
    await this.delete({ _id: (file as any)._id } as any);
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
      const files = await this.findAll({ storageDirPath: dirPath } as any);
      for (const file of files) {
          await this.performHardDeleteFile(file);
      }

      // 2. Subdirectories
      const subDirs = await this.fileDirectoryService.findAll({ 
          parentPath: dirPath
      } as any);
      for (const subDir of subDirs) {
          await this.deleteDirectoryRecursively((subDir as any).path);
          await this.fileDirectoryService.delete({ _id: (subDir as any)._id } as any);
          await this.deleteCloudFolderHelper((subDir as any).path);
      }
  }

  async softDelete(filter: FilterQuery<IFileStorageAttributes>, options?: any): Promise<any> {
      // 1. Try to find File first
      const file = await this.findOne(filter);
      if (file) {
          // Perform Hard Delete as requested for cleanup
          await this.performHardDeleteFile(file);
          return { acknowledged: true, modifiedCount: 1, upsertedId: null, upsertedCount: 0, matchedCount: 1 };
      }
      
      // 2. Try to find Directory
      const id = filter._id || filter.id || (filter as any)._id; // Check different forms
      if (id) { 
          const dir = await this.fileDirectoryService.findById(id as string);
          if (dir) {
              await this.deleteDirectoryRecursively((dir as any).path);
              await this.fileDirectoryService.delete({ _id: (dir as any)._id } as any);
              await this.deleteCloudFolderHelper((dir as any).path);
              return { acknowledged: true, modifiedCount: 1, upsertedId: null, upsertedCount: 0, matchedCount: 1 };
          }
      }
      
      return { acknowledged: true, modifiedCount: 0, upsertedId: null, upsertedCount: 0, matchedCount: 0 };
  }
}

export const fileStorageService = new FileStorageService();

