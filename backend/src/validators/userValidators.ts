import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter, 
  booleanFilter 
} from './validatorCommon';

const userFilterSchema = baseFilterSchema.extend({
  email: stringFilter,
  mobile: stringFilter,
  firstName: stringFilter,
  lastName: stringFilter,
  type: stringFilter,
  status: stringFilter,
  isEmailVerified: booleanFilter,
  isMobileVerified: booleanFilter,
  isVerified: booleanFilter,
  gender: stringFilter,
  countryCode: stringFilter,
});

const userCreateSchema = z.object({
  email: z.string().email(),
  mobile: z.string(),
  password: z.string().min(6),
  firstName: z.string().max(50),
  lastName: z.string().max(50),
  countryCode: z.string(),
  type: z.string().optional(),
}).strict();

const userUpdateSchema = z.object({
  status: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  mobile: z.string().optional(),
  type: z.string().optional(),
  isEmailVerified: z.boolean().optional(),
  isMobileVerified: z.boolean().optional(),
  isVerified: z.boolean().optional(),
}).strict();

export default class UserValidator {
  getOne = validate(
    z.object({
      body: userFilterSchema.partial().optional(),
      query: userFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: userFilterSchema.partial().optional(),
      query: userFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: userFilterSchema.partial().merge(paginationSchema).optional(),
      query: userFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: userCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: userUpdateSchema.partial(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: userFilterSchema.partial(),
    })
  );
}
