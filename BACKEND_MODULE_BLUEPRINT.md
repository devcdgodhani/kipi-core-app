# Backend Module Blueprint - Strict Structure Guide

## Overview
This document defines the **EXACT** structure that MUST be followed for all new backend modules. This blueprint is extracted from the User module and is **NON-NEGOTIABLE**.

---

## Complete File Structure for Each New Module

For a module named `[ModuleName]` (e.g., Banner, Notification, FlashDeal), create the following files:

### 1. Database Model
**Location**: `backend/src/db/mongodb/models/[moduleName]Model.ts`

**Pattern**:
```typescript
import { Schema, model } from 'mongoose';
import { I[ModuleName]Document } from '../../../interfaces/[moduleName]';
import { [MODULE_NAME]_STATUS } from '../../../constants';

const [moduleName]Schema = new Schema<I[ModuleName]Document>(
  {
    // fields here
    status: { 
      type: String, 
      enum: Object.values([MODULE_NAME]_STATUS), 
      default: [MODULE_NAME]_STATUS.ACTIVE 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
[moduleName]Schema.index({ /* fields */ });

export const [ModuleName]Model = model<I[ModuleName]Document>('[ModuleName]', [moduleName]Schema);
```

---

### 2. Interface (Model Attributes)
**Location**: `backend/src/interfaces/[moduleName].ts`

**Pattern**:
```typescript
import { Document, ObjectId } from 'mongoose';
import { [MODULE_NAME]_STATUS } from '../constants';
import { IDefaultAttributes } from './common';

export interface I[ModuleName]Attributes extends IDefaultAttributes {
  _id: ObjectId;
  // module-specific fields
  status: [MODULE_NAME]_STATUS;
}

export interface I[ModuleName]Document extends Omit<I[ModuleName]Attributes, '_id'>, Document {}
```

---

### 3. Constants & Enums
**Location**: `backend/src/constants/[moduleName].ts` OR add to `backend/src/constants/common.ts`

**Pattern**:
```typescript
export enum [MODULE_NAME]_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export const [MODULE_NAME]_SUCCESS_MESSAGES = {
  GET_SUCCESS: '[ModuleName] retrieved successfully',
  CREATE_SUCCESS: '[ModuleName] created successfully',
  UPDATE_SUCCESS: '[ModuleName] updated successfully',
  DELETE_SUCCESS: '[ModuleName] deleted successfully',
};
```

---

### 4. Types (Request/Response)
**Location**: `backend/src/types/[moduleName].ts`

**Pattern**:
```typescript
import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { I[ModuleName]Attributes } from '../interfaces';

export type T[ModuleName]Res = IApiResponse<I[ModuleName]Attributes>;
export type T[ModuleName]ListRes = IApiResponse<I[ModuleName]Attributes[]>;
export type T[ModuleName]ListPaginationRes = IPaginationApiResponse<I[ModuleName]Attributes>;
```

---

### 5. Service Contract (Interface)
**Location**: `backend/src/services/contracts/[moduleName]ServiceInterface.ts`

**Pattern**:
```typescript
import { I[ModuleName]Attributes, I[ModuleName]Document } from '../../interfaces';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface I[ModuleName]Service extends IMongooseCommonService<I[ModuleName]Attributes, I[ModuleName]Document> {}
```

---

### 6. Concrete Service
**Location**: `backend/src/services/concrete/[moduleName]Service.ts`

**Pattern**:
```typescript
import { [ModuleName]Model } from '../../db/mongodb';
import { I[ModuleName]Attributes, I[ModuleName]Document } from '../../interfaces';
import { I[ModuleName]Service } from '../contracts/[moduleName]ServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class [ModuleName]Service
  extends MongooseCommonService<I[ModuleName]Attributes, I[ModuleName]Document>
  implements I[ModuleName]Service
{
  constructor() {
    super([ModuleName]Model as any);
  }
}

export const [moduleName]Service = new [ModuleName]Service();
```

---

### 7. Controller
**Location**: `backend/src/controllers/[moduleName]Controller.ts`
**Role**: Interfaces with the service and handles HTTP request/response logic. Must include standard CRUD methods: `getAll`, `getOne`, `getWithPagination`, `create`, `updateById`, `deleteByFilter`.

---

### 8. Validators
**Location**: `backend/src/validators/[moduleName]Validators.ts`
**Role**: Uses Zod (or similar) to validate incoming request bodies, query params, and route params for each controller action.

---

### 9. Routes
**Location**: `backend/src/routes/admin/[moduleName]Routes.ts` and `backend/src/routes/customer/[moduleName]Routes.ts`
**Standard Endpoints**: `/getOne`, `/getAll`, `/getWithPagination`, `/` (POST), `/:id` (PUT), `/deleteByFilter` (DELETE).

---

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| **File names** | camelCase + suffix | `bannerModel.ts` |
| **Model** | PascalCase + Model | `BannerModel` |
| **Interface** | I + PascalCase + Attributes/Document | `IBannerAttributes` |
| **Enum** | SCREAMING_SNAKE_CASE | `BANNER_STATUS` |
| **Type** | T + PascalCase + Res | `TBannerRes` |
| **Service** | PascalCase + Service | `BannerService` |
| **Instance** | camelCase + Service | `bannerService` |

---

## Checklist for New Module

- [ ] Model in `db/mongodb/models/`
- [ ] Interface in `interfaces/`
- [ ] Constants in `constants/`
- [ ] Types in `types/`
- [ ] Service interface in `services/contracts/`
- [ ] Concrete service in `services/concrete/`
- [ ] Controller in `controllers/`
- [ ] Validator in `validators/`
- [ ] Admin routes in `routes/admin/`
- [ ] Customer routes in `routes/customer/`
- [ ] Register routes in index files
