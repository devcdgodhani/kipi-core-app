import axiosInstance from './http';
import { type IFileStorage, type IFileStorageFilters, type IPaginationData } from '../types/fileStorage';

export const fileStorageService = {
  getWithPagination: async (filters: IFileStorageFilters) => {
    return axiosInstance.post<any, { data: IPaginationData<IFileStorage>, message: string }>('/file-storage/getWithPagination', filters);
  },

  getAll: async (filters: IFileStorageFilters) => {
    return axiosInstance.post<any, { data: IFileStorage[], message: string }>('/file-storage/getAll', filters);
  },

  getOne: async (id: string) => {
    return axiosInstance.post<any, { data: IFileStorage, message: string }>('/file-storage/getOne', { _id: id });
  },

  update: async (id: string, fileData: Partial<IFileStorage>) => {
    return axiosInstance.put<any, { message: string }>(`/file-storage/${id}`, fileData);
  },

  delete: async (id: string) => {
    return axiosInstance.delete<any, { message: string }>('/file-storage/deleteByFilter', { data: { _id: id } });
  },

  upload: async (files: File[], storageDirPath?: string) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (storageDirPath) {
      formData.append('storageDirPath', storageDirPath);
    }

    // Since we are using FormData, we might need to let the browser set the Content-Type
    // But axios instance defaults to json. We can override headers in the call.
    return axiosInstance.post<any, { data: IFileStorage[], message: string }>('/file-storage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }
};
