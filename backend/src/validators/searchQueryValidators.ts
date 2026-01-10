import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { baseFilterSchema, paginationSchema, stringFilter, numberFilter } from './validatorCommon';

const searchQueryFilterSchema = baseFilterSchema.extend({
  userId: stringFilter,
  query: stringFilter,
  status: stringFilter,
});

const searchQueryCreateSchema = z.object({
  userId: z.string().optional(),
  query: z.string(),
  resultCount: z.number().optional(),
  status: z.string().optional(),
}).strict();

const trackSearchSchema = z.object({
  query: z.string(),
  resultCount: z.number(),
}).strict();

export class SearchQueryValidator {
  getOne = validate(z.object({ body: searchQueryFilterSchema.partial().optional(), query: searchQueryFilterSchema.partial().optional() }));
  getAll = validate(z.object({ body: searchQueryFilterSchema.partial().optional(), query: searchQueryFilterSchema.partial().optional() }));
  getWithPagination = validate(z.object({ body: searchQueryFilterSchema.partial().merge(paginationSchema).optional(), query: searchQueryFilterSchema.partial().merge(paginationSchema).optional() }));
  create = validate(z.object({ body: searchQueryCreateSchema }));
  updateById = validate(z.object({ params: z.object({ id: z.string() }), body: searchQueryCreateSchema.partial() }));
  deleteByFilter = validate(z.object({ body: searchQueryFilterSchema.partial() }));
  trackSearch = validate(z.object({ body: trackSearchSchema }));
}

export const searchQueryValidator = new SearchQueryValidator();
