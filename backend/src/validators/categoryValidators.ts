import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter, 
  booleanFilter 
} from './validatorCommon';
import { CATEGORY_STATUS } from '../constants';

const categoryFilterSchema = baseFilterSchema.extend({
  name: stringFilter,
  slug: stringFilter,
  parentId: stringFilter,
  status: stringFilter,
  isTree: z.boolean().optional(),
});

const categoryCreateSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional().nullable(),
  description: z.string().optional(),
  image: z.string().optional(),
  status: z.enum(CATEGORY_STATUS).optional(),
  order: z.number().optional(),
}).strict();

const categoryUpdateSchema = categoryCreateSchema.partial();

export default class CategoryValidator {
  getOne = validate(
    z.object({
      body: categoryFilterSchema.partial().optional(),
      query: categoryFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: categoryFilterSchema.partial().optional(),
      query: categoryFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: categoryFilterSchema.partial().merge(paginationSchema).optional(),
      query: categoryFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: categoryCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: categoryUpdateSchema,
    })
  );

  deleteByFilter = validate(
    z.object({
      body: categoryFilterSchema.partial(),
    })
  );
}
