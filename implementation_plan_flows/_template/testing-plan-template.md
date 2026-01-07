# [Module Name] - Testing Plan

## Testing Strategy

### Test Pyramid
```
        /\
       /  \      E2E Tests (10%)
      /____\
     /      \    Integration Tests (30%)
    /________\
   /          \  Unit Tests (60%)
  /____________\
```

---

## Unit Tests

### Backend Unit Tests

#### Service Tests
**File**: `backend/src/tests/services/moduleService.test.ts`

**Test Cases**:
- [ ] `create()` - Successfully creates a module
- [ ] `create()` - Throws error on duplicate name
- [ ] `create()` - Validates required fields
- [ ] `findAll()` - Returns all modules
- [ ] `findAll()` - Filters by status
- [ ] `findAll()` - Filters by userId
- [ ] `findOne()` - Returns single module
- [ ] `findOne()` - Returns null if not found
- [ ] `updateOne()` - Successfully updates module
- [ ] `updateOne()` - Throws error if not found
- [ ] `softDelete()` - Marks module as deleted
- [ ] `softDelete()` - Sets deletedAt timestamp

**Example**:
```typescript
describe('ModuleService', () => {
  let moduleService: ModuleService;

  beforeEach(() => {
    moduleService = new ModuleService();
  });

  describe('create', () => {
    it('should create a module successfully', async () => {
      const moduleData = {
        name: 'Test Module',
        description: 'Test Description',
        userId: new Types.ObjectId(),
      };

      const result = await moduleService.create(moduleData);

      expect(result).toBeDefined();
      expect(result.name).toBe(moduleData.name);
    });

    it('should throw error on duplicate name', async () => {
      // Test implementation
    });
  });
});
```

---

#### Controller Tests
**File**: `backend/src/tests/controllers/moduleController.test.ts`

**Test Cases**:
- [ ] `getAll()` - Returns 200 with modules
- [ ] `getAll()` - Returns empty array if no modules
- [ ] `getOne()` - Returns 200 with module
- [ ] `getOne()` - Returns 404 if not found
- [ ] `create()` - Returns 201 on success
- [ ] `create()` - Returns 400 on validation error
- [ ] `updateById()` - Returns 200 on success
- [ ] `updateById()` - Returns 404 if not found
- [ ] `deleteByFilter()` - Returns 200 on success
- [ ] All endpoints - Return 401 without auth token

---

### Frontend Unit Tests

#### Component Tests
**File**: `src/components/Module/ModuleCard.test.tsx`

**Test Cases**:
- [ ] Renders module information correctly
- [ ] Shows edit button for admin users
- [ ] Shows delete button for admin users
- [ ] Calls onEdit when edit button clicked
- [ ] Calls onDelete when delete button clicked
- [ ] Displays status badge correctly
- [ ] Handles missing optional fields

**Example**:
```typescript
describe('ModuleCard', () => {
  const mockModule = {
    _id: '1',
    name: 'Test Module',
    description: 'Test Description',
    status: 'ACTIVE',
  };

  it('renders module information correctly', () => {
    render(<ModuleCard module={mockModule} />);
    
    expect(screen.getByText('Test Module')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(<ModuleCard module={mockModule} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(mockModule);
  });
});
```

---

#### Redux Slice Tests
**File**: `src/features/module/moduleSlice.test.ts`

**Test Cases**:
- [ ] Initial state is correct
- [ ] `fetchModules.pending` sets loading to true
- [ ] `fetchModules.fulfilled` updates modules
- [ ] `fetchModules.rejected` sets error
- [ ] `setSelectedModule` updates selectedModule
- [ ] `clearError` clears error state

---

#### Service Tests
**File**: `src/services/module.service.test.ts`

**Test Cases**:
- [ ] `getAll()` - Makes correct API call
- [ ] `getById()` - Makes correct API call with ID
- [ ] `create()` - Sends correct payload
- [ ] `update()` - Sends correct payload
- [ ] `delete()` - Makes correct API call
- [ ] All methods - Handle network errors

---

## Integration Tests

### Backend Integration Tests

**File**: `backend/src/tests/integration/module.integration.test.ts`

**Test Cases**:
- [ ] Full CRUD flow works end-to-end
- [ ] Authentication is enforced
- [ ] Validation errors are returned correctly
- [ ] Related models are populated correctly
- [ ] Pagination works correctly
- [ ] Filtering works correctly
- [ ] Soft delete works correctly

**Example**:
```typescript
describe('Module API Integration', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Setup: Create user and get auth token
    const user = await createTestUser();
    authToken = await getAuthToken(user);
    userId = user._id;
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await cleanupTestData();
  });

  it('should complete full CRUD flow', async () => {
    // Create
    const createRes = await request(app)
      .post('/api/v1/customer/module')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Module' });
    
    expect(createRes.status).toBe(201);
    const moduleId = createRes.body.data._id;

    // Read
    const getRes = await request(app)
      .post('/api/v1/customer/module/getOne')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ _id: moduleId });
    
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.name).toBe('Test Module');

    // Update
    const updateRes = await request(app)
      .put(`/api/v1/customer/module/${moduleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated Module' });
    
    expect(updateRes.status).toBe(200);

    // Delete
    const deleteRes = await request(app)
      .delete('/api/v1/customer/module/deleteByFilter')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ _id: moduleId });
    
    expect(deleteRes.status).toBe(200);
  });
});
```

---

### Frontend Integration Tests

**File**: `src/tests/integration/module.integration.test.tsx`

**Test Cases**:
- [ ] User can view module list
- [ ] User can create new module
- [ ] User can edit existing module
- [ ] User can delete module
- [ ] Search filters modules correctly
- [ ] Pagination works correctly
- [ ] Error states display correctly

---

## E2E Tests

### User Flows

**File**: `e2e/module.e2e.test.ts`

**Test Cases**:
- [ ] Admin can create, edit, and delete modules
- [ ] Customer can view modules but not edit
- [ ] Search functionality works
- [ ] Pagination works across pages
- [ ] Form validation prevents invalid submissions
- [ ] Success messages display after actions
- [ ] Error messages display on failures

**Example**:
```typescript
describe('Module Management E2E', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:3000/login');
    await loginAsAdmin(page);
  });

  it('should create a new module', async () => {
    await page.goto('http://localhost:3000/modules');
    await page.click('button:has-text("Create Module")');
    
    await page.fill('input[name="name"]', 'E2E Test Module');
    await page.fill('textarea[name="description"]', 'E2E Test Description');
    await page.click('button:has-text("Create")');
    
    await expect(page.locator('text=Module created successfully')).toBeVisible();
    await expect(page.locator('text=E2E Test Module')).toBeVisible();
  });
});
```

---

## Test Coverage Goals

| Layer | Target Coverage |
|-------|----------------|
| Backend Services | 90% |
| Backend Controllers | 80% |
| Frontend Components | 80% |
| Frontend Services | 90% |
| Redux Slices | 90% |
| Overall | 85% |

---

## Test Data Management

### Test Database
- Use separate test database
- Reset database before each test suite
- Use factories for test data creation

### Mock Data
```typescript
// tests/factories/moduleFactory.ts
export const createMockModule = (overrides = {}) => ({
  _id: new Types.ObjectId().toString(),
  name: 'Test Module',
  description: 'Test Description',
  status: 'ACTIVE',
  userId: new Types.ObjectId().toString(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
```

---

## Performance Tests

### Load Testing
- [ ] API can handle 100 concurrent requests
- [ ] Response time < 200ms for simple queries
- [ ] Response time < 500ms for complex queries
- [ ] Database queries are optimized

### Stress Testing
- [ ] System handles 1000 modules per user
- [ ] Pagination performs well with large datasets
- [ ] Search performs well with large datasets

---

## Security Tests

- [ ] Authentication is required for all endpoints
- [ ] Users can only access their own modules
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting works correctly

---

## Accessibility Tests

- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG AA
- [ ] Form labels are associated
- [ ] Error messages are accessible

---

## CI/CD Integration

### Pre-commit Hooks
```bash
npm run lint
npm run type-check
npm run test:unit
```

### CI Pipeline
```yaml
- Run linting
- Run type checking
- Run unit tests
- Run integration tests
- Generate coverage report
- Fail if coverage < 85%
```

### CD Pipeline
```yaml
- Run all tests
- Build application
- Deploy to staging
- Run E2E tests on staging
- Deploy to production (if all pass)
```

---

## Test Execution

### Run All Tests
```bash
# Backend
cd backend
npm run test

# Frontend
cd customer
npm run test
```

### Run Specific Tests
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## Continuous Monitoring

### Metrics to Track
- Test execution time
- Test failure rate
- Code coverage trends
- Flaky test identification

### Alerts
- Alert on test failures in CI
- Alert on coverage drops
- Alert on performance regressions
