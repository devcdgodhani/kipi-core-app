# [Module Name] - Database Schema

## Models

### 1. [ModelName] Model

**File**: `backend/src/db/mongodb/models/modelNameModel.ts`

**Schema**:
```typescript
{
  // Primary fields
  name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  description: {
    type: String,
    maxLength: 500,
  },
  
  // Status and type
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
    default: 'ACTIVE',
  },
  type: {
    type: String,
    enum: ['TYPE_A', 'TYPE_B', 'TYPE_C'],
  },
  
  // Relationships
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  relatedId: {
    type: Schema.Types.ObjectId,
    ref: 'relatedModel',
  },
  
  // Metadata
  metadata: {
    key1: String,
    key2: Number,
  },
  
  // Timestamps (automatic)
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
  
  // Audit fields
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
}
```

**Indexes**:
```typescript
// Compound index for common queries
{ userId: 1, status: 1 }

// Unique index
{ name: 1, userId: 1 } (unique)

// Text index for search
{ name: 'text', description: 'text' }
```

**Hooks**:
```typescript
// Pre-save hook
modelSchema.pre('save', async function(next) {
  // Logic before saving
  next();
});

// Post-save hook
modelSchema.post('save', async function(doc) {
  // Logic after saving
});
```

---

## Relationships

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│    User     │────────<│   Module    │
└─────────────┘         └─────────────┘
                              │
                              │
                              ▼
                        ┌─────────────┐
                        │  Related    │
                        │   Model     │
                        └─────────────┘
```

### Relationship Details

#### User → Module (One-to-Many)
- One user can have many modules
- `Module.userId` references `User._id`
- Cascade delete: When user is deleted, mark modules as deleted

#### Module → RelatedModel (One-to-One)
- One module has one related model
- `Module.relatedId` references `RelatedModel._id`
- Optional relationship

---

## Enums & Constants

**File**: `backend/src/constants/module.ts`

```typescript
export const MODULE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
} as const;

export const MODULE_TYPE = {
  TYPE_A: 'TYPE_A',
  TYPE_B: 'TYPE_B',
  TYPE_C: 'TYPE_C',
} as const;
```

---

## Interfaces

**File**: `backend/src/interfaces/module.ts`

```typescript
import { Document, Types } from 'mongoose';

export interface IModuleAttributes {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  status: string;
  type?: string;
  userId: Types.ObjectId;
  relatedId?: Types.ObjectId;
  metadata?: {
    key1?: string;
    key2?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
}

export interface IModuleDocument extends IModuleAttributes, Document {
  // Mongoose document methods
}
```

---

## Migrations

### Migration 1: Create Module Collection
**Date**: YYYY-MM-DD

**Changes**:
- Create `modules` collection
- Add indexes
- Seed initial data (if needed)

**Script**:
```typescript
// backend/src/db/mongodb/migrations/001_create_modules.ts
export async function up() {
  // Create collection
  await db.createCollection('modules');
  
  // Create indexes
  await db.collection('modules').createIndex({ userId: 1, status: 1 });
  await db.collection('modules').createIndex({ name: 1, userId: 1 }, { unique: true });
}

export async function down() {
  // Rollback
  await db.collection('modules').drop();
}
```

---

### Migration 2: Add New Field
**Date**: YYYY-MM-DD

**Changes**:
- Add `newField` to existing documents

**Script**:
```typescript
export async function up() {
  await db.collection('modules').updateMany(
    {},
    { $set: { newField: 'default_value' } }
  );
}

export async function down() {
  await db.collection('modules').updateMany(
    {},
    { $unset: { newField: '' } }
  );
}
```

---

## Data Validation

### Schema-Level Validation
- Required fields enforced by Mongoose
- Enum values validated
- String length limits
- Type checking

### Application-Level Validation
- Zod validators in `backend/src/validators/moduleValidators.ts`
- Business rule validation in service layer
- Unique constraint checks

---

## Sample Data

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Sample Module",
  "description": "This is a sample module",
  "status": "ACTIVE",
  "type": "TYPE_A",
  "userId": "507f1f77bcf86cd799439012",
  "relatedId": "507f1f77bcf86cd799439013",
  "metadata": {
    "key1": "value1",
    "key2": 123
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "createdBy": "507f1f77bcf86cd799439012"
}
```

---

## Performance Considerations

### Indexes
- Compound index on `userId` and `status` for common queries
- Text index for search functionality
- Unique index to prevent duplicates

### Query Optimization
- Use `.lean()` for read-only queries
- Limit populated fields
- Use pagination for large datasets
- Cache frequently accessed data

### Scaling
- Shard on `userId` for horizontal scaling
- Archive old/deleted records
- Implement read replicas for heavy read workloads

---

## Backup & Recovery

### Backup Strategy
- Daily automated backups
- Retain backups for 30 days
- Point-in-time recovery enabled

### Recovery Procedures
1. Identify backup point
2. Restore from backup
3. Verify data integrity
4. Resume operations
