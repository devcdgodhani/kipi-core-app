import { z } from 'zod';

export const resolveNdrSchema = z.object({
  body: z.object({
    resolution: z.string().min(1, 'Resolution is required'),
    customerAction: z.string().optional(),
    rescheduledDate: z.string().datetime().optional().or(z.date().optional()),
    updatedAddress: z.any().optional(),
  }),
  params: z.object({
    ndrId: z.string().min(1, 'NDR ID is required'),
  }),
});

export const getNdrSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'NDR ID is required'),
  }),
});
