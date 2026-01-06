import { z } from 'zod';

export const calculateEtaSchema = z.object({
  body: z.object({
    destinationPincode: z.string().min(1, 'Destination pincode is required'),
    courierId: z.string().optional(), // If not provided, returns comparison
    pickupPincode: z.string().optional(), // Defaults to configured warehouse
    weight: z.number().min(0.1, 'Weight is required (min 0.1kg)').optional(),
  }),
});
