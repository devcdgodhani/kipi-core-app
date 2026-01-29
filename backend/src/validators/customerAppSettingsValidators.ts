import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { CUSTOMER_APP_SETTINGS_STATUS } from '../constants/customerAppSettings';

const sectionSchema = z.object({
  sectionId: z.string(),
  isVisible: z.boolean(),
  displayOrder: z.number(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  viewAllLink: z.string().optional(),
  viewAllText: z.string().optional(),
  limit: z.number().optional(),
});

const featureSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  displayOrder: z.number(),
});

const footerSchema = z.object({
  brand: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
  }),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string(),
    isActive: z.boolean(),
  })),
  columns: z.array(z.object({
    title: z.string(),
    links: z.array(z.object({
      label: z.string(),
      url: z.string(),
      isActive: z.boolean(),
    })),
    displayOrder: z.number(),
  })),
  contact: z.object({
    address: z.string(),
    phone: z.string(),
    email: z.string().email(),
  }),
  copyright: z.string(),
  language: z.string(),
  currency: z.string(),
});

const createSchema = z.object({
  sections: z.array(sectionSchema),
  features: z.array(featureSchema),
  footer: footerSchema,
  logo: z.string().optional(),
  appName: z.string(),
  favicon: z.string().optional(),
  status: z.nativeEnum(CUSTOMER_APP_SETTINGS_STATUS).optional(),
  isDefault: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

class CustomerAppSettingsValidator {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await createSchema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await updateSchema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await updateSchema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate filter in body if needed
      next();
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate query params if needed
      next();
    } catch (error) {
      next(error);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate pagination params if needed
      next();
    } catch (error) {
      next(error);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate filter in body
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const customerAppSettingsValidator = new CustomerAppSettingsValidator();
