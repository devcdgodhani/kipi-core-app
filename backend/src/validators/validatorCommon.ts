import { z } from 'zod';

export const stringFilter = z.union([z.string(), z.array(z.string())]).optional();

export const numberFilter = z.union([
  z.coerce.number(),
  z.array(z.coerce.number()),
  z.object({
    from: z.coerce.number().optional(),
    to: z.coerce.number().optional(),
    lt: z.coerce.number().optional(),
    gt: z.coerce.number().optional(),
  }),
]).optional();

export const dateFilter = z.union([
  z.coerce.date(),
  z.array(z.coerce.date()),
  z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    lt: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
  }),
]).optional();

export const booleanFilter = z.preprocess((val) => {
  if (Array.isArray(val)) {
    return val.map((v) => v === 'true' || v === true);
  }
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return val;
}, z.union([z.boolean(), z.array(z.boolean())]).optional());

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
  isPaginate: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }, z.boolean().optional()),
  order: z.record(z.string(), z.coerce.number().transform(v => (v === -1 ? -1 : 1))).optional(),
});

export const baseFilterSchema = z.object({
  _id: stringFilter,
  id: stringFilter,
  search: z.string().optional(),
  createdAt: dateFilter,
  updatedAt: dateFilter,
  deletedAt: dateFilter,
  createdBy: stringFilter,
  updatedBy: stringFilter,
  deletedBy: stringFilter,
});
