import { IFileStorageAttributes, IFileStorageDocument, IFileDirectoryAttributes } from '../../interfaces';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IFileStorageService
  extends IMongooseCommonService<IFileStorageAttributes, IFileStorageDocument> {
  generatePresignedUrl(fileId: string, expiryTime?: number): Promise<string>;
  cleanExpiredPresignedUrls(): Promise<void>;
  uploadFiles(files: any[], data: any): Promise<IFileStorageAttributes[]>;
  createFolder(name: string, storageDirPath?: string): Promise<IFileStorageAttributes>;
  moveFile(fileId: string, newStorageDirPath: string): Promise<IFileStorageAttributes>;
  getFilesAndFolders(filter: any, options?: any, populate?: any): Promise<{ dirList: IFileDirectoryAttributes[], fileList: IFileStorageAttributes[] }>;
}
