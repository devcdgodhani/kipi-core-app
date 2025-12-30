import { z } from 'zod';
import { ATTRIBUTE_TYPE, PRODUCT_STATUS } from '../constants';
import { paginationSchema } from './validatorCommon';

// Attribute Validators
export const createAttributeSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().min(1, 'Code is required').regex(/^[a-z0-9-_]+$/, 'Code must be lowercase alphanumeric with hyphens/underscores'),
    type: z.nativeEnum(ATTRIBUTE_TYPE),
    options: z.array(z.string()).optional(),
    isRequired: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }).refine((data) => {
    if ((data.type === ATTRIBUTE_TYPE.SELECT || data.type === ATTRIBUTE_TYPE.MULTISELECT) && (!data.options || data.options.length === 0)) {
      return false;
    }
    return true;
  }, {
    message: 'Options are required for SELECT/MULTISELECT types',
    path: ['body', 'options'],
  }),
});

export const updateAttributeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID'),
  }),
  body: z.object({
    name: z.string().optional(),
    options: z.array(z.string()).optional(),
    isRequired: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Category Validators
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    parentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Parent ID').optional().nullable(),
    attributes: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID'),
  }),
  body: z.object({
    name: z.string().optional(),
    parentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
    attributes: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Product Validators
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Category ID'),
    brand: z.string().optional(),
    basePrice: z.number().min(0),
    status: z.nativeEnum(PRODUCT_STATUS).optional(),
    specifications: z.record(z.string(), z.any()).optional(),
    
    // Variant generation input
    variants: z.array(z.object({
      sku: z.string().min(1),
      price: z.number().min(0),
      stock: z.number().min(0),
      attributes: z.array(z.object({
        attributeId: z.string().regex(/^[0-9a-fA-F]{24}$/),
        value: z.string(),
      })),
      images: z.array(z.string()).optional(),
    })).optional(),
  }),
});

export const searchProductSchema = z.object({
  query: paginationSchema.merge(z.object({
    category: z.string().optional(),
    minPrice: z.string().optional(), // Query params are strings usually
    maxPrice: z.string().optional(),
    status: z.nativeEnum(PRODUCT_STATUS).optional(),
  })),
});
