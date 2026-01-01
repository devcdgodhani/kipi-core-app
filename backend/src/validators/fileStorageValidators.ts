import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter, 
  booleanFilter,
  mongoIdFilter
} from './validatorCommon';

const fileStorageFilterSchema = baseFilterSchema.extend({
  cloudType: stringFilter,
  status: stringFilter,
  fileType: stringFilter,
  originalFileName: stringFilter,
  storageFileName: stringFilter,
  storageDirPath: stringFilter,
  fileExtension: stringFilter,
  isInUsed: booleanFilter,
  _id: mongoIdFilter,
});

const fileStorageUpdateSchema = z.object({
  isInUsed: z.boolean().optional(),
  status: z.string().optional(),
}).strict();

export default class FileStorageValidator {
  getOne = validate(
    z.object({
      body: fileStorageFilterSchema.partial().optional(),
      query: fileStorageFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: fileStorageFilterSchema.partial().optional(),
      query: fileStorageFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: fileStorageFilterSchema.partial().merge(paginationSchema).optional(),
      query: fileStorageFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  // Upload validation is handled by multer and service logic mostly, 
  // but we can validate the accompanying body if needed
  upload = validate(
    z.object({
      body: z.object({
        storageDirPath: z.string().optional(),
      }),
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: fileStorageUpdateSchema.partial(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: fileStorageFilterSchema.partial(),
    })
  );

  createFolder = validate(
    z.object({
      body: z.object({
        name: z.string().min(1),
        storageDirPath: z.string().optional(),
      }),
    })
  );

  moveFile = validate(
    z.object({
      body: z.object({
        fileId: z.string(), 
        newStorageDirPath: z.string().optional(),
      }),
    })
  );
}
