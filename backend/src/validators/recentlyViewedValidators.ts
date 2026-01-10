import { z } from 'zod';
import { validate } from '../helpers/zodValidator';

const trackViewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
}).strict();

const getRecentlyViewedQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
});

export class RecentlyViewedValidator {
  trackView = validate(
    z.object({
      body: trackViewSchema,
    })
  );

  getRecentlyViewed = validate(
    z.object({
      query: getRecentlyViewedQuerySchema.optional(),
    })
  );
}

export const recentlyViewedValidator = new RecentlyViewedValidator();
