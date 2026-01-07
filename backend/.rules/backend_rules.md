# Backend Development Rules

## Project Structure

### Directory Organization
```
backend/src/
├── configs/          # Configuration files (env, database, services)
├── constants/        # Enums, status codes, error messages
├── controllers/      # Request handlers
├── db/mongodb/       # Database layer
│   ├── models/       # Mongoose schemas
│   └── seeders/      # Database seeders
├── helpers/          # Utility functions
├── interfaces/       # TypeScript interfaces (model field attributes)
├── jobs/             # Background job processors
├── middlewares/      # Express middleware
├── routes/           # API route definitions
│   ├── admin/        # Admin routes
│   ├── customer/     # Customer routes
│   └── common/       # Shared routes
├── scripts/          # Utility scripts
├── services/         # Business logic (every service must have contract and concrete)
│   ├── concrete/     # Service implementations
│   └── contracts/    # Service interfaces
├── types/            # Type definitions (request types, response types, module-related types)
└── validators/       # Request validators (Zod - every API endpoint must have appropriate validator)
```

## Naming Conventions

### Files
- **Models**: `{entity}Model.ts` (e.g., `productModel.ts`)
- **Services**: `{entity}Service.ts` (e.g., `productService.ts`)
- **Controllers**: `{entity}Controller.ts` (e.g., `productController.ts`)
- **Routes**: `{entity}Routes.ts` (e.g., `productRoutes.ts`)
- **Validators**: `{entity}Validators.ts` (e.g., `productValidators.ts`)
- **Interfaces**: `{entity}.ts` (e.g., `product.ts`)
- **Types**: `{entity}.ts` (e.g., `product.ts`)

### Code
- **Classes**: PascalCase (e.g., `ProductService`, `OrderController`)
- **Functions/Methods**: camelCase (e.g., `createProduct`, `getOrderById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ORDER_STATUS`, `HTTP_STATUS_CODE`)
- **Interfaces**: IPascalCase (e.g., `IProductAttributes`, `IOrderDocument`)
- **Types**: TPascalCase (e.g., `TOrderCreateReq`, `TProductRes`)
- **Enums**: PascalCase (e.g., `OrderStatus`, `PaymentMethod`)

## Interfaces vs Types

### Interfaces (`interfaces/`)
**Purpose**: Define model field attributes and database document structures

**Examples**:
- `IProductAttributes` - Product model fields
- `IOrderDocument` - Order document with Mongoose methods
- `IUserAttributes` - User model fields
- `IAddressAttributes` - Address model fields

**Usage**: Extend from `IDefaultAttributes` for common fields (createdAt, updatedAt, etc.)

### Types (`types/`)
**Purpose**: Define request/response types and module-specific types

**Examples**:
- `TOrderCreateReq` - Order creation request
- `TProductRes` - Product response
- `TOrderListPaginationRes` - Paginated order list response
- Module-specific types that don't represent database models

**Rule**: If it's a database model structure, use Interface. If it's an API contract or utility type, use Type.

## Service Architecture

### Contract and Concrete Pattern
**Every service MUST have both a contract (interface) and concrete (implementation)**

**Contract** (`services/contracts/`):
```typescript
// services/contracts/productServiceInterface.ts
export interface IProductService {
  customMethod(params: any): Promise<any>;
}
```

**Concrete** (`services/concrete/`):
```typescript
// services/concrete/productService.ts
export class ProductService
  extends MongooseCommonService<IProductAttributes, IProductDocument>
  implements IProductService
{
  constructor() {
    super(ProductModel);
  }

  async customMethod(params: any): Promise<any> {
    // Implementation
  }
}
```

**Benefits**:
- Type safety and contract enforcement
- Easy to mock for testing
- Clear separation of interface and implementation
- Supports dependency injection

## Validator Requirements

### Every API Endpoint Must Have a Validator
**Rule**: No endpoint should be created without proper Zod validation

**Why**:
- Prevents invalid data from reaching controllers
- Provides clear error messages
- Type-safe validation
- Auto-documentation of API contracts

**Example**:
```typescript
// ❌ BAD - No validator
router.post('/product', productController.create);

// ✅ GOOD - With validator
router.post('/product', jwtAuth(), productValidator.create, productController.create);
```

**Validator Coverage**:
- All query parameters
- All request body fields
- All URL parameters
- File uploads (if applicable)

## Model Structure

### Mongoose Schema Template
```typescript
import { Schema, model } from 'mongoose';
import { I{Entity}Document } from '../../../interfaces/{entity}';
import { {ENTITY}_STATUS, {ENTITY}_TYPE } from '../../../constants/{entity}';

export const {Entity}Schema = new Schema<I{Entity}Document>(
  {
    // Fields with validation
    name: { type: String, required: true, maxLength: 100 },
    status: { 
      type: String, 
      enum: Object.values({ENTITY}_STATUS), 
      default: {ENTITY}_STATUS.ACTIVE 
    },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    // ... other fields
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
{Entity}Schema.index({ userId: 1, status: 1 });

// Pre/Post hooks if needed
{Entity}Schema.pre('save', async function (next) {
  // Logic here
  next();
});

export const {Entity}Model = model<I{Entity}Document>('{Entity}', {Entity}Schema);
```

### Required Fields in All Models
- `createdAt`, `updatedAt` (via timestamps: true)
- `status` field with enum (ACTIVE, INACTIVE, DELETED, etc.)
- Proper indexes for frequently queried fields

## Service Structure

### Service Template
```typescript
import { {Entity}Model } from '../../db/mongodb/models/{entity}Model';
import { I{Entity}Attributes, I{Entity}Document } from '../../interfaces/{entity}';
import { I{Entity}Service } from '../contracts/{entity}ServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class {Entity}Service
  extends MongooseCommonService<I{Entity}Attributes, I{Entity}Document>
  implements I{Entity}Service
{
  constructor() {
    super({Entity}Model);
  }

  // Custom business logic methods
  async customMethod(params: any): Promise<any> {
    // Implementation
  }
}
```

### Service Rules
1. **Extend MongooseCommonService** for standard CRUD operations
2. **Implement service interface** for type safety
3. **Business logic only** - no HTTP concerns
4. **Return data** - don't format responses
5. **Throw errors** - let error middleware handle them
6. **Use transactions** for multi-document operations
7. **Validate business rules** before database operations

## Controller Structure

### Controller Template
```typescript
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { {Entity}Service } from '../services/concrete/{entity}Service';
import { IApiResponse, IPaginationData, I{Entity}Attributes } from '../interfaces';

const {ENTITY}_SUCCESS_MESSAGES = {
  GET_SUCCESS: '{Entity} retrieved successfully',
  CREATE_SUCCESS: '{Entity} created successfully',
  UPDATE_SUCCESS: '{Entity} updated successfully',
  DELETE_SUCCESS: '{Entity} deleted successfully',
};

export default class {Entity}Controller {
  {entity}Service = new {Entity}Service();

  constructor() {}

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.{entity}Service.generateFilter({ filters: reqData });
      const {entity} = await this.{entity}Service.findOne(filter, options);

      const response: IApiResponse<I{Entity}Attributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: {ENTITY}_SUCCESS_MESSAGES.GET_SUCCESS,
        data: {entity},
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.{entity}Service.generateFilter({ filters: reqData });
      const {entity}List = await this.{entity}Service.findAll(filter, options);

      const response: IApiResponse<I{Entity}Attributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: {ENTITY}_SUCCESS_MESSAGES.GET_SUCCESS,
        data: {entity}List,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.{entity}Service.generateFilter({ filters: reqData });
      const {entity}List = await this.{entity}Service.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<I{Entity}Attributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: {ENTITY}_SUCCESS_MESSAGES.GET_SUCCESS,
        data: {entity}List,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {entity}Data = req.body;
      const new{Entity} = await this.{entity}Service.create({entity}Data, { userId: req.user?._id });

      const response: IApiResponse<I{Entity}Attributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: {ENTITY}_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: new{Entity},
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      await this.{entity}Service.updateOne({ _id: id }, updateData, { userId: req.user._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: {ENTITY}_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.{entity}Service.generateFilter({ filters: reqData });
      await this.{entity}Service.softDelete(filter, { userId: req.user._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: {ENTITY}_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
```

### Controller Rules
1. **Handle HTTP only** - delegate business logic to services
2. **Use try-catch** - pass errors to next()
3. **Standard response format** - always use IApiResponse
4. **Extract user from req.user** - set by jwtAuth middleware
5. **Validate with Zod** - use validators in routes
6. **Return proper status codes** - 200, 201, 400, 404, etc.

## Route Structure

### Route Template
```typescript
import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import {Entity}Controller from '../../controllers/{entity}Controller';
import {Entity}Validator from '../../validators/{entity}Validators';

const router = Router();
const {entity}Controller = new {Entity}Controller();
const {entity}Validator = new {Entity}Validator();

router.route('/getOne')
  .get(jwtAuth(), {entity}Validator.getOne, {entity}Controller.getOne)
  .post(jwtAuth(), {entity}Validator.getOne, {entity}Controller.getOne);

router.route('/getAll')
  .get(jwtAuth(), {entity}Validator.getAll, {entity}Controller.getAll)
  .post(jwtAuth(), {entity}Validator.getAll, {entity}Controller.getAll);

router.route('/getWithPagination')
  .get(jwtAuth(), {entity}Validator.getWithPagination, {entity}Controller.getWithPagination)
  .post(jwtAuth(), {entity}Validator.getWithPagination, {entity}Controller.getWithPagination);

router.route('/')
  .post(jwtAuth(), {entity}Validator.create, {entity}Controller.create);

router.route('/:id')
  .put(jwtAuth(), {entity}Validator.updateById, {entity}Controller.updateById);

router.delete('/deleteByFilter', jwtAuth(), {entity}Validator.deleteByFilter, {entity}Controller.deleteByFilter);

export default router;
```

### Route Rules
1. **Use jwtAuth()** for protected routes
2. **Validate before controller** - middleware order matters
3. **Support GET and POST** for queries (for complex filters)
4. **RESTful naming** - use HTTP verbs properly
5. **Consistent paths** - `/getOne`, `/getAll`, `/getWithPagination`, `/`, `/:id`, `/deleteByFilter`

## Validator Structure

### Validator Template
```typescript
import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { baseFilterSchema, paginationSchema, stringFilter, booleanFilter } from './validatorCommon';

const {entity}FilterSchema = baseFilterSchema.extend({
  userId: stringFilter,
  status: stringFilter,
  // ... other filterable fields
});

const {entity}CreateSchema = z.object({
  name: z.string().max(100),
  status: z.string().optional(),
  // ... other fields
}).strict();

const {entity}UpdateSchema = z.object({
  name: z.string().max(100).optional(),
  status: z.string().optional(),
  // ... other fields
}).strict();

export default class {Entity}Validator {
  getOne = validate(
    z.object({
      body: {entity}FilterSchema.partial().optional(),
      query: {entity}FilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: {entity}FilterSchema.partial().optional(),
      query: {entity}FilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: {entity}FilterSchema.partial().merge(paginationSchema).optional(),
      query: {entity}FilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: {entity}CreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({ id: z.string() }),
      body: {entity}UpdateSchema.partial(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: {entity}FilterSchema.partial(),
    })
  );
}
```

### Validator Rules
1. **Use Zod** for all validation
2. **Strict mode** - `.strict()` to prevent extra fields
3. **Reuse common schemas** - baseFilterSchema, paginationSchema
4. **Partial for updates** - `.partial()` for PATCH operations
5. **Validate params, query, body** separately

## API Response Standards

### Success Response
```typescript
{
  status: 200,
  code: "SUCCESS",
  message: "Operation successful",
  data: { ... }
}
```

### Error Response
```typescript
{
  status: 400,
  code: "VALIDATION_ERROR",
  message: "Invalid input data",
  errors?: [ ... ]
}
```

### Pagination Response
```typescript
{
  status: 200,
  code: "SUCCESS",
  message: "Data retrieved successfully",
  data: {
    recordList: [ ... ],
    totalRecords: 100,
    totalPages: 10,
    currentPage: 1,
    limit: 10,
    hasPreviousPage: false,
    hasNextPage: true
  }
}
```

## Security Rules

1. **Always use jwtAuth** for protected routes
2. **Validate all inputs** with Zod
3. **Hash passwords** with bcrypt
4. **Sanitize user input** to prevent injection
5. **Use HTTPS** in production
6. **Rate limit** API endpoints
7. **Log security events** with Winston
8. **Never expose sensitive data** in responses

## Error Handling

### Custom Error Class
```typescript
export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    public message: string,
    public errors?: any[]
  ) {
    super(message);
  }
}
```

### Usage
```typescript
throw new ApiError(
  HTTP_STATUS_CODE.NOT_FOUND.CODE,
  HTTP_STATUS_CODE.NOT_FOUND.STATUS,
  'Product not found'
);
```

## Database Best Practices

1. **Use indexes** for frequently queried fields
2. **Soft delete** instead of hard delete
3. **Timestamps** on all models
4. **Audit fields** - createdBy, updatedBy, deletedBy
5. **Transactions** for multi-document operations
6. **Populate sparingly** - avoid N+1 queries
7. **Lean queries** when possible for performance

## Code Quality

1. **TypeScript strict mode** enabled
2. **ESLint** for code quality
3. **Prettier** for formatting
4. **Meaningful variable names** - no single letters
5. **Comments for complex logic** only
6. **DRY principle** - don't repeat yourself
7. **SOLID principles** - especially Single Responsibility

## Testing (When Implemented)

1. **Unit tests** for services
2. **Integration tests** for controllers
3. **E2E tests** for critical flows
4. **Mock external services**
5. **Test edge cases**
6. **Aim for 80%+ coverage**

## Git Commit Conventions

```
feat: Add product search functionality
fix: Fix order calculation bug
refactor: Refactor user service
docs: Update API documentation
test: Add tests for cart service
chore: Update dependencies
```

## Environment Variables

Always use environment variables for:
- Database URLs
- API keys
- Secret keys
- Port numbers
- External service URLs
- Feature flags

## Performance Optimization

1. **Use Redis** for caching
2. **Pagination** for large datasets
3. **Lazy loading** for relationships
4. **Database indexes** for queries
5. **Compression** for responses
6. **Rate limiting** to prevent abuse
7. **Background jobs** for heavy operations
