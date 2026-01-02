import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { baseFilterSchema, paginationSchema } from './validatorCommon';

const orderItemSchema = z.object({
  productId: z.string().min(1),
  skuId: z.string().optional(),
  name: z.string().min(1),
  quantity: z.number().min(1),
  price: z.number().min(0),
  total: z.number().min(0),
  image: z.string().optional()
});

const addressSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  pincode: z.string().min(1),
  landmark: z.string().optional()
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  paymentMethod: z.enum(['COD', 'ONLINE']),
  subTotal: z.number().min(0),
  tax: z.number().default(0),
  shippingCost: z.number().default(0),
  totalAmount: z.number().min(0),
  notes: z.string().optional()
});

export default class OrderValidator {
  create = validate(
      z.object({
          body: createOrderSchema
      })
  );

  getMyOrders = validate(
      z.object({
          query: baseFilterSchema.partial().merge(paginationSchema).optional(),
          body: baseFilterSchema.partial().merge(paginationSchema).optional()
      })
  );

  getOne = validate(
      z.object({
          params: z.object({
              id: z.string().min(1)
          })
      })
  );
}
