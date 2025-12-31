import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter, 
  booleanFilter 
} from './validatorCommon';
import { ATTRIBUTE_STATUS, ATTRIBUTE_VALUE_TYPE, ATTRIBUTE_INPUT_TYPE } from '../constants';

const attributeFilterSchema = baseFilterSchema.extend({
  name: stringFilter,
  slug: stringFilter,
  valueType: stringFilter,
  inputType: stringFilter,
  status: stringFilter,
  isFilterable: booleanFilter,
  isRequired: booleanFilter,
  isVariant: booleanFilter,
  categoryIds: z.union([z.string(), z.array(z.string())]).optional(),
});

const attributeOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  color: z.string().optional(),
});

const attributeValidationSchema = z.object({
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  customMessage: z.string().optional(),
});

const attributeCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  valueType: z.nativeEnum(ATTRIBUTE_VALUE_TYPE),
  inputType: z.nativeEnum(ATTRIBUTE_INPUT_TYPE),
  options: z.array(attributeOptionSchema).optional(),
  defaultValue: z.any().optional(),
  validation: attributeValidationSchema.optional(),
  unit: z.string().optional(),
  isFilterable: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  isVariant: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
  order: z.number().optional(),
  status: z.nativeEnum(ATTRIBUTE_STATUS).optional(),
});

const attributeUpdateSchema = attributeCreateSchema.partial();

export default class AttributeValidator {
  getOne = validate(
    z.object({
      body: attributeFilterSchema.partial().optional(),
      query: attributeFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: attributeFilterSchema.partial().optional(),
      query: attributeFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: attributeFilterSchema.partial().merge(paginationSchema).optional(),
      query: attributeFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: attributeCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: attributeUpdateSchema,
    })
  );

  deleteByFilter = validate(
    z.object({
      body: attributeFilterSchema.partial(),
    })
  );
}
