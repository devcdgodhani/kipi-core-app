import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { baseFilterSchema, paginationSchema } from './validatorCommon';

const userFilterSchema = baseFilterSchema.extend({
  email: z.union([z.string(), z.array(z.string())]).optional(),
  mobile: z.union([z.string(), z.array(z.string())]).optional(),
  firstName: z.union([z.string(), z.array(z.string())]).optional(),
  lastName: z.union([z.string(), z.array(z.string())]).optional(),
  type: z.union([z.string(), z.array(z.string())]).optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  isEmailVerified: z.union([z.string(), z.array(z.string())]).optional(),
  isMobileVerified: z.union([z.string(), z.array(z.string())]).optional(),
  isVerified: z.union([z.string(), z.array(z.string())]).optional(),
  gender: z.union([z.string(), z.array(z.string())]).optional(),
  countryCode: z.union([z.string(), z.array(z.string())]).optional(),
}).strict();

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
