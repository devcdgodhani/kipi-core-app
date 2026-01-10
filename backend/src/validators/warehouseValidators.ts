import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema 
} from './validatorCommon';

const warehouseFilterSchema = baseFilterSchema.extend({
  name: z.string().optional(),
  code: z.string().optional(),
  isActive: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
});

const warehouseCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required').toUpperCase(),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().default('India'),
    pincode: z.string().length(6, 'Pincode must be 6 digits'),
    landmark: z.string().optional(),
  }),
  contactPerson: z.string().min(1, 'Contact person is required'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  isActive: z.boolean().default(true),
  isPrimary: z.boolean().default(false),
});

const warehouseUpdateSchema = warehouseCreateSchema.partial();

export class WarehouseValidator {
  getOne = validate(
    z.object({
      body: warehouseFilterSchema.partial().optional(),
      query: warehouseFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: warehouseFilterSchema.partial().optional(),
      query: warehouseFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: warehouseFilterSchema.partial().merge(paginationSchema).optional(),
      query: warehouseFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: warehouseCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: warehouseUpdateSchema,
    })
  );

  deleteByFilter = validate(
    z.object({
      body: warehouseFilterSchema.partial(),
    })
  );
}

export const warehouseValidator = new WarehouseValidator();
