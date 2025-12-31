import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
  isPaginate: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }, z.boolean().optional()),
  order: z.record(z.string(), z.union([z.literal(1), z.literal(-1)])).optional(),
}).strict();

export const baseFilterSchema = z.object({
  _id: z.union([z.string(), z.array(z.string())]).optional(),
  search: z.string().optional(),
}).strict();
