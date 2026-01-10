import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter, 
  booleanFilter,
  dateFilter
} from './validatorCommon';

const notificationFilterSchema = baseFilterSchema.extend({
  userId: stringFilter,
  type: stringFilter,
  isRead: booleanFilter,
  status: stringFilter,
});

const notificationCreateSchema = z.object({
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  data: z.any().optional(),
  imageUrl: z.string().optional(),
  actionUrl: z.string().optional(),
  status: z.string().optional(),
}).strict();

const notificationUpdateSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  isRead: z.boolean().optional(),
  imageUrl: z.string().optional(),
  actionUrl: z.string().optional(),
  status: z.string().optional(),
}).strict();

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()),
}).strict();

export class NotificationValidator {
  getOne = validate(
    z.object({
      body: notificationFilterSchema.partial().optional(),
      query: notificationFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: notificationFilterSchema.partial().optional(),
      query: notificationFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: notificationFilterSchema.partial().merge(paginationSchema).optional(),
      query: notificationFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: notificationCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: notificationUpdateSchema.partial(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: notificationFilterSchema.partial(),
    })
  );

  markAsRead = validate(
    z.object({
      body: markAsReadSchema,
    })
  );
}

export const notificationValidator = new NotificationValidator();
