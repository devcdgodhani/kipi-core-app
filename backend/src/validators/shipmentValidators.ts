import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { paginationSchema } from './validatorCommon';

export const shipmentCreateSchema = z.object({
  orderId: z.string().min(24),
  courierId: z.number().optional(),
  weight: z.number().min(0.1).optional(),
  dimensions: z.object({
    length: z.number().min(0.5),
    width: z.number().min(0.5),
    height: z.number().min(0.5)
  }).optional()
}).strict();

export const shipmentFilterSchema = z.object({
  status: z.string().optional(),
  orderId: z.string().optional(),
  awb: z.string().optional(),
  isRTO: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  ...paginationSchema.shape
});

export const shipmentUpdateSchema = z.object({
  status: z.string().min(1),
  notes: z.string().optional()
}).strict();

export const shipmentCancelSchema = z.object({
  reason: z.string().min(1),
  notes: z.string().optional()
}).strict();

export class ShipmentValidator {
  create = validate(
    z.object({
      body: shipmentCreateSchema
    })
  );

  getAll = validate(
    z.object({
      body: shipmentFilterSchema
    })
  );

  track = validate(
    z.object({
      params: z.object({
        awb: z.string().min(1)
      })
    })
  );

  updateStatus = validate(
    z.object({
      params: z.object({
        id: z.string().min(24)
      }),
      body: shipmentUpdateSchema
    })
  );

  cancel = validate(
    z.object({
      params: z.object({
        id: z.string().min(24)
      }),
      body: shipmentCancelSchema
    })
  );
  
  checkServiceability = validate(
    z.object({
      body: z.object({
        pickupPincode: z.string().length(6).regex(/^\d{6}$/),
        deliveryPincode: z.string().length(6).regex(/^\d{6}$/),
        weight: z.number().min(0.1).default(0.5),
        cod: z.boolean().default(false)
      }).strict()
    })
  );
}

export const shipmentValidator = new ShipmentValidator();
