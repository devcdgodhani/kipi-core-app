export interface IFileStorage {
  _id: string;
  originalFileName: string;
  storageFileName: string;
  storageDirPath?: string;
  storageDir?: string;
  preSignedUrl?: string; // This is populated
  fileSize?: number;
  fileExtension?: string;
  fileType: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' | 'OTHER' | 'DIRECTORY';
  isInUsed: boolean;
  cloudType: 'AWS_S3' | 'CLOUDINARY';
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

export interface IFileStorageFilters {
  cloudType?: string;
  fileType?: string;
  search?: string;
  storageDir?: string;
  storageDirPath?: string;
  page?: number;
  limit?: number;
  sort?: any;
}

export interface IPaginationData<T> {
  recordList: T[];
  totalRecords: number;
  limit: number;
  totalPages: number;
  currentPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
