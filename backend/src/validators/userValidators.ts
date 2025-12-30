import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { baseFilterSchema, paginationSchema } from './validatorCommon';

const userFilterSchema = baseFilterSchema.extend({
  email: z.string().optional(),
  mobile: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const userCreateSchema = z.object({
  email: z.string().email(),
  mobile: z.string(),
  password: z.string().min(6),
  firstName: z.string().max(50),
  lastName: z.string().max(50),
  countryCode: z.string(),
});

const userUpdateSchema = z.object({
  status: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  mobile: z.string().optional(),
});

export default class UserValidator {
  getOne = validate(
    z.object({
      body: userFilterSchema.partial(),
      query: userFilterSchema.partial(),
    })
  );

  getAll = validate(
    z.object({
      body: userFilterSchema.partial(),
      query: userFilterSchema.partial(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: userFilterSchema.partial().merge(paginationSchema),
      query: userFilterSchema.partial().merge(paginationSchema),
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
