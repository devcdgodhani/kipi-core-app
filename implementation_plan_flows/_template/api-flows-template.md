# [Module Name] - API Flows

## Base URL
- **Customer**: `/api/v1/customer/module`
- **Admin**: `/api/v1/admin/module`

## Authentication
All endpoints require JWT authentication via `jwtAuth()` middleware.

---

## Endpoints

### 1. Create Module
**Endpoint**: `POST /module`

**Request**:
```json
{
  "name": "string",
  "description": "string",
  "status": "ACTIVE"
}
```

**Response** (201):
```json
{
  "status": 201,
  "code": "CREATED",
  "message": "Module created successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "status": "ACTIVE",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Errors**:
- 400: Validation error
- 401: Unauthorized
- 500: Server error

---

### 2. Get All Modules
**Endpoint**: `POST /module/getAll`

**Request**:
```json
{
  "status": "ACTIVE",
  "search": "keyword"
}
```

**Response** (200):
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "Modules retrieved successfully",
  "data": [
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "status": "ACTIVE"
    }
  ]
}
```

---

### 3. Get Module with Pagination
**Endpoint**: `POST /module/getWithPagination`

**Request**:
```json
{
  "status": "ACTIVE",
  "page": 1,
  "limit": 10,
  "order": { "createdAt": -1 }
}
```

**Response** (200):
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "Modules retrieved successfully",
  "data": {
    "recordList": [...],
    "totalRecords": 100,
    "totalPages": 10,
    "currentPage": 1,
    "limit": 10,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

---

### 4. Get Single Module
**Endpoint**: `POST /module/getOne`

**Request**:
```json
{
  "_id": "module_id"
}
```

**Response** (200):
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "Module retrieved successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "status": "ACTIVE"
  }
}
```

---

### 5. Update Module
**Endpoint**: `PUT /module/:id`

**Request**:
```json
{
  "name": "Updated name",
  "description": "Updated description"
}
```

**Response** (200):
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "Module updated successfully"
}
```

---

### 6. Delete Module
**Endpoint**: `DELETE /module/deleteByFilter`

**Request**:
```json
{
  "_id": "module_id"
}
```

**Response** (200):
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "Module deleted successfully"
}
```

---

## Flow Diagrams

### Create Flow
```
User → Frontend → API → Validator → Controller → Service → Database
                                                              ↓
User ← Frontend ← API ← Controller ← Service ← Database
```

### Read Flow
```
User → Frontend → API → Validator → Controller → Service → Database
                                                              ↓
User ← Frontend ← API ← Controller ← Service ← Database (with data)
```

### Update Flow
```
User → Frontend → API → Validator → Controller → Service → Database (find & update)
                                                              ↓
User ← Frontend ← API ← Controller ← Service ← Database (confirmation)
```

### Delete Flow
```
User → Frontend → API → Validator → Controller → Service → Database (soft delete)
                                                              ↓
User ← Frontend ← API ← Controller ← Service ← Database (confirmation)
```

---

## Error Handling

### Validation Errors (400)
```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "status": 401,
  "code": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

### Not Found (404)
```json
{
  "status": 404,
  "code": "NOT_FOUND",
  "message": "Module not found"
}
```

### Server Error (500)
```json
{
  "status": 500,
  "code": "INTERNAL_SERVER_ERROR",
  "message": "An error occurred"
}
```

---

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user

## Caching
- GET requests cached for 5 minutes
- Cache invalidated on POST/PUT/DELETE
