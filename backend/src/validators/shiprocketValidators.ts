import { z } from 'zod';

export const shiprocketValidator = {
  checkServiceability: z.object({
    body: z.object({
      pickupPincode: z.string().length(6).regex(/^\d{6}$/),
      deliveryPincode: z.string().length(6).regex(/^\d{6}$/),
      weight: z.number().min(0.1).default(0.5),
      cod: z.boolean().default(false)
    }).strict()
  }),

  createOrder: z.object({
    body: z.object({
      orderId: z.string().min(1),
      length: z.number().min(0.5),
      width: z.number().min(0.5),
      height: z.number().min(0.5),
      weight: z.number().min(0.1)
    }).strict()
  }),

  trackShipment: z.object({
    params: z.object({
      awb: z.string().min(1)
    })
  })
};
