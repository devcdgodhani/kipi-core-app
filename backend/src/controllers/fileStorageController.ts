import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, FILE_STORAGE_SUCCESS_MESSAGES } from '../constants';
import { FileStorageService } from '../services/concrete/fileStorageService';
import { IApiResponse, IPaginationData, IFileStorageAttributes, IFileDirectoryAttributes } from '../interfaces';

export default class FileStorageController {
  fileStorageService = new FileStorageService();

  constructor() {}

  /*********** Fetch files ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.fileStorageService.generateFilter({
        filters: reqData,
      });

      const file = await this.fileStorageService.findOne(filter, options);

      const response: IApiResponse<IFileStorageAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FILE_STORAGE_SUCCESS_MESSAGES.GET_SUCCESS,
        data: file,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.fileStorageService.generateFilter({
        filters: reqData,
        searchFields: ['originalFileName', 'storageFileName'],
      });

      const { dirList, fileList } = await this.fileStorageService.getFilesAndFolders(filter, options);

      const response: IApiResponse<{ dirList: IFileDirectoryAttributes[], fileList: IFileStorageAttributes[] }> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FILE_STORAGE_SUCCESS_MESSAGES.GET_SUCCESS,
        data: { dirList, fileList },
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.fileStorageService.generateFilter({
        filters: reqData,
        searchFields: ['originalFileName', 'storageFileName'],
      });

      const fileList = await this.fileStorageService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<IFileStorageAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FILE_STORAGE_SUCCESS_MESSAGES.GET_SUCCESS,
        data: fileList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Upload file ***********/
  upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      const reqData = req.body;
      
      const uploadedFiles = await this.fileStorageService.uploadFiles(files, reqData);

      const response: IApiResponse<IFileStorageAttributes[]> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: FILE_STORAGE_SUCCESS_MESSAGES.UPLOAD_SUCCESS,
        data: uploadedFiles,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update file ***********/
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      await this.fileStorageService.updateOne({ _id: id }, updateData, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FILE_STORAGE_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete file ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.fileStorageService.generateFilter({
        filters: reqData,
      });

      await this.fileStorageService.softDelete(filter, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FILE_STORAGE_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Create Folder ***********/
  createFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, storageDirPath } = req.body;
      const folder = await this.fileStorageService.createFolder(name, storageDirPath);
      const response: IApiResponse<IFileStorageAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: FILE_STORAGE_SUCCESS_MESSAGES.UPLOAD_SUCCESS,
        data: folder,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Move File ***********/
  moveFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileId, newStorageDirPath } = req.body;
      const newFile = await this.fileStorageService.moveFile(fileId, newStorageDirPath);
      const response: IApiResponse<IFileStorageAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FILE_STORAGE_SUCCESS_MESSAGES.UPDATE_SUCCESS,
        data: newFile,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
