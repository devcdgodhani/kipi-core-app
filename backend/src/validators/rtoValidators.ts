import { z } from 'zod';

export const calculateRtoScoreSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    pincode: z.string().min(1, 'Pincode is required'),
    orderAmount: z.number().min(0, 'Order amount must be 0 or more'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
  }),
});

export const getRtoHistorySchema = z.object({
  query: z.object({
    userId: z.string().optional(),
    orderId: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
