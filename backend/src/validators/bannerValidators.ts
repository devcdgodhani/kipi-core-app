import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter, 
  booleanFilter,
  dateFilter,
  numberFilter
} from './validatorCommon';

const bannerFilterSchema = baseFilterSchema.extend({
  title: stringFilter,
  linkType: stringFilter,
  status: stringFilter,
  isActive: booleanFilter,
  targetAudience: stringFilter,
  displayOrder: numberFilter,
});

const bannerCreateSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  imageId: z.string(),
  mobileImageId: z.string().optional(),
  linkType: z.string(),
  linkValue: z.string().optional(),
  displayOrder: z.number().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  isActive: z.boolean().optional(),
  targetAudience: z.string().optional(),
  status: z.string().optional(),
}).strict();

const bannerUpdateSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  imageId: z.string().optional(),
  mobileImageId: z.string().optional(),
  linkType: z.string().optional(),
  linkValue: z.string().optional(),
  displayOrder: z.number().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  isActive: z.boolean().optional(),
  targetAudience: z.string().optional(),
  status: z.string().optional(),
}).strict();

export class BannerValidator {
  getOne = validate(
    z.object({
      body: bannerFilterSchema.partial().optional(),
      query: bannerFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: bannerFilterSchema.partial().optional(),
      query: bannerFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: bannerFilterSchema.partial().merge(paginationSchema).optional(),
      query: bannerFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: bannerCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: bannerUpdateSchema.partial(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: bannerFilterSchema.partial(),
    })
  );
}

export const bannerValidator = new BannerValidator();
