# [Module Name] - UI Flows

## User Journeys

### 1. View Module List
**Actor**: User (Customer/Admin)

**Steps**:
1. User navigates to module page
2. System loads modules from API
3. System displays loading spinner
4. System renders module list
5. User sees all modules

**Components**:
- `ModulePage.tsx`
- `ModuleList.tsx`
- `ModuleCard.tsx`
- `LoadingSpinner.tsx`

**State**:
```typescript
{
  modules: Module[],
  loading: true,
  error: null
}
```

---

### 2. Create New Module
**Actor**: User (Admin)

**Steps**:
1. User clicks "Create Module" button
2. System opens modal/form
3. User fills in module details
4. User clicks "Submit"
5. System validates input
6. System sends API request
7. System shows success message
8. System refreshes module list

**Components**:
- `ModuleForm.tsx`
- `Modal.tsx`
- `Button.tsx`
- `Input.tsx`

**State**:
```typescript
{
  isModalOpen: true,
  formData: { name: '', description: '' },
  errors: {},
  submitting: false
}
```

---

### 3. Edit Module
**Actor**: User (Admin)

**Steps**:
1. User clicks "Edit" on module card
2. System opens modal with pre-filled data
3. User modifies fields
4. User clicks "Save"
5. System validates input
6. System sends API request
7. System shows success message
8. System updates module in list

**Components**:
- `ModuleForm.tsx`
- `Modal.tsx`

**State**:
```typescript
{
  isModalOpen: true,
  editingModule: Module,
  formData: { ...module },
  errors: {},
  submitting: false
}
```

---

### 4. Delete Module
**Actor**: User (Admin)

**Steps**:
1. User clicks "Delete" on module card
2. System shows confirmation dialog
3. User confirms deletion
4. System sends API request
5. System shows success message
6. System removes module from list

**Components**:
- `ConfirmDialog.tsx`
- `ModuleCard.tsx`

**State**:
```typescript
{
  showConfirm: true,
  deletingId: 'module_id'
}
```

---

### 5. Search/Filter Modules
**Actor**: User

**Steps**:
1. User types in search box
2. System debounces input (300ms)
3. System filters modules locally or via API
4. System updates displayed list

**Components**:
- `SearchBar.tsx`
- `ModuleList.tsx`

**State**:
```typescript
{
  searchQuery: 'keyword',
  filteredModules: Module[]
}
```

---

## Component Hierarchy

```
ModulePage
├── PageHeader
│   ├── Title
│   └── CreateButton
├── SearchBar
├── FilterPanel (optional)
└── ModuleList
    ├── LoadingSpinner (if loading)
    ├── EmptyState (if no data)
    └── ModuleCard[] (if data)
        ├── ModuleInfo
        └── ActionButtons
            ├── EditButton
            └── DeleteButton

Modals:
├── ModuleFormModal
│   └── ModuleForm
│       ├── Input (name)
│       ├── Textarea (description)
│       ├── Select (status)
│       └── FormButtons
└── ConfirmDialog
    ├── Message
    └── ActionButtons
```

---

## State Management

### Redux Slice
```typescript
// moduleSlice.ts
interface ModuleState {
  modules: Module[];
  selectedModule: Module | null;
  loading: boolean;
  error: string | null;
}

// Actions
- fetchModules (async thunk)
- createModule (async thunk)
- updateModule (async thunk)
- deleteModule (async thunk)
- setSelectedModule (sync)
- clearError (sync)
```

### Local Component State
```typescript
// ModulePage.tsx
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingModule, setEditingModule] = useState<Module | null>(null);
const [searchQuery, setSearchQuery] = useState('');

// ModuleForm.tsx
const [formData, setFormData] = useState<FormData>({});
const [errors, setErrors] = useState<FormErrors>({});
const [submitting, setSubmitting] = useState(false);
```

---

## Wireframes

### Module List Page
```
┌─────────────────────────────────────────┐
│ Navbar                                  │
├─────────────────────────────────────────┤
│ ┌─────────────────┐  ┌──────────────┐  │
│ │ Modules         │  │ + Create     │  │
│ └─────────────────┘  └──────────────┘  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🔍 Search modules...                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Module Card 1                       │ │
│ │ Description...                      │ │
│ │ [Edit] [Delete]                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Module Card 2                       │ │
│ │ Description...                      │ │
│ │ [Edit] [Delete]                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Create/Edit Modal
```
┌─────────────────────────────────────────┐
│ Create Module                      [X]  │
├─────────────────────────────────────────┤
│                                         │
│ Name *                                  │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Description                             │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Status                                  │
│ ┌─────────────────────────────────────┐ │
│ │ Active ▼                            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│           [Cancel]  [Create Module]    │
└─────────────────────────────────────────┘
```

---

## Responsive Design

### Mobile (< 640px)
- Single column layout
- Stack cards vertically
- Hamburger menu for navigation
- Bottom sheet for forms

### Tablet (640px - 1024px)
- Two column layout
- Side drawer for filters
- Modal for forms

### Desktop (> 1024px)
- Three column layout
- Sidebar for filters
- Modal for forms
- Hover states on cards

---

## Loading States

### Initial Load
```tsx
{loading && <LoadingSpinner />}
```

### Pagination Load
```tsx
{loadingMore && <LoadingSpinner size="small" />}
```

### Form Submit
```tsx
<Button loading={submitting}>
  {submitting ? 'Creating...' : 'Create Module'}
</Button>
```

---

## Error States

### API Error
```tsx
{error && (
  <ErrorMessage 
    message={error} 
    onRetry={() => dispatch(fetchModules())} 
  />
)}
```

### Form Validation Error
```tsx
{errors.name && (
  <ErrorText>{errors.name}</ErrorText>
)}
```

### Empty State
```tsx
{!loading && modules.length === 0 && (
  <EmptyState 
    icon={<Icon />}
    title="No modules found"
    description="Create your first module to get started"
    action={<Button onClick={handleCreate}>Create Module</Button>}
  />
)}
```

---

## Accessibility

- [ ] Keyboard navigation support
- [ ] ARIA labels on interactive elements
- [ ] Focus management in modals
- [ ] Screen reader announcements
- [ ] Color contrast compliance
- [ ] Alt text on images
- [ ] Form labels associated with inputs

---

## Performance Optimizations

- [ ] Lazy load module list
- [ ] Debounce search input
- [ ] Memoize expensive computations
- [ ] Virtual scrolling for large lists
- [ ] Optimize images
- [ ] Code splitting
