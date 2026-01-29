import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { THEME_APP_NAME } from '../constants/theme';
import { baseFilterSchema, paginationSchema } from './validatorCommon';

const colorsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  background: z.string(),
  accent: z.string(),
});

const createThemeSchema = z.object({
  appName: z.nativeEnum(THEME_APP_NAME),
  name: z.string().optional(),
  colors: colorsSchema,
});

const updateThemeSchema = z.object({
  name: z.string().optional(),
  colors: colorsSchema.partial().optional(),
  status: z.string().optional()
});

export class ThemeValidator {
  create = validate(
    z.object({
      body: createThemeSchema,
    })
  );

  updateByAppName = validate(
      z.object({
          params: z.object({
              appName: z.nativeEnum(THEME_APP_NAME)
          }),
          body: updateThemeSchema
      })
  );
  
  getByAppName = validate(
    z.object({
        params: z.object({
            appName: z.nativeEnum(THEME_APP_NAME)
        })
    })
  );

  // Standard CRUD
  getOne = validate(
    z.object({
        params: z.object({
            id: z.string().optional()
        }).optional(),
        body: z.object({}).passthrough().optional(),
        query: z.object({}).passthrough().optional()
    })
  );

  getAll = validate(
      z.object({
          body: z.object({}).passthrough().optional(),
          query: z.object({}).passthrough().optional()
      })
  );

  getWithPagination = validate(
    z.object({
      query: paginationSchema.partial().merge(z.object({
        sortBy: z.string().optional(),
        sortOrder: z.string().optional(),
      })).optional(),
    })
  );

  deleteByFilter = validate(
      z.object({
          body: z.object({}).passthrough()
      })
  );
  
  updateById = validate(
    z.object({
        params: z.object({
            id: z.string()
        }),
        body: updateThemeSchema
    })
  );
}

export const themeValidator = new ThemeValidator();
