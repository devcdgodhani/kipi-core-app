import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { baseFilterSchema, paginationSchema, stringFilter, booleanFilter } from './validatorCommon';

const addressFilterSchema = baseFilterSchema.extend({
  userId: stringFilter,
  type: stringFilter,
  status: stringFilter,
  isDefault: booleanFilter,
  city: stringFilter,
  state: stringFilter,
  pincode: stringFilter,
});

const locationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.array(z.number()).length(2), // [longitude, latitude]
});

const addressCreateSchema = z.object({
  userId: z.string(),
  name: z.string().max(100),
  mobile: z.string().max(15),
  alternateMobile: z.string().max(15).optional(),
  street: z.string().max(200),
  landmark: z.string().max(100).optional(),
  city: z.string().max(100),
  state: z.string().max(100),
  pincode: z.string().max(10),
  country: z.string().max(100).optional(),
  type: z.string().optional(),
  location: locationSchema.optional(),
  isDefault: z.boolean().optional(),
  status: z.string().optional(),
}).strict();

const addressUpdateSchema = z.object({
  name: z.string().max(100).optional(),
  mobile: z.string().max(15).optional(),
  alternateMobile: z.string().max(15).optional(),
  street: z.string().max(200).optional(),
  landmark: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  country: z.string().max(100).optional(),
  type: z.string().optional(),
  location: locationSchema.optional(),
  isDefault: z.boolean().optional(),
  status: z.string().optional(),
}).strict();

export default class AddressValidator {
  getOne = validate(
    z.object({
      body: addressFilterSchema.partial().optional(),
      query: addressFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: addressFilterSchema.partial().optional(),
      query: addressFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: addressFilterSchema.partial().merge(paginationSchema).optional(),
      query: addressFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: addressCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({ id: z.string() }),
      body: addressUpdateSchema.partial(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: addressFilterSchema.partial(),
    })
  );
}
