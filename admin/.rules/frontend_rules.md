# Frontend Development Rules (Customer & Admin Apps)

## Project Structure

### Directory Organization
```
src/
├── assets/           # Static assets (images, fonts)
├── components/       # Reusable components
│   ├── {Feature}/    # Feature-specific components
│   └── common/       # Shared components
├── context/          # React Context providers
├── features/         # Redux slices
├── hooks/            # Custom React hooks
├── layouts/          # Page layouts
├── pages/            # Page components
│   └── {Feature}/    # Feature pages
├── routes/           # Route configuration
├── services/         # API service layer
├── types/            # TypeScript types
├── utils/            # Utility functions
├── App.tsx           # Root component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Naming Conventions

### Files & Folders
- **Components**: PascalCase (e.g., `ProductCard.tsx`, `UserProfile.tsx`)
- **Pages**: PascalCase (e.g., `ProductList.tsx`, `OrderDetails.tsx`)
- **Services**: camelCase (e.g., `product.service.ts`, `auth.service.ts`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`, `useCart.ts`)
- **Types**: camelCase (e.g., `product.types.ts`, `order.types.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`, `validation.ts`)
- **Contexts**: PascalCase with 'Context' suffix (e.g., `AuthContext.tsx`)
- **Slices**: camelCase with 'Slice' suffix (e.g., `authSlice.ts`)

### Code
- **Components**: PascalCase (e.g., `ProductCard`, `UserProfile`)
- **Functions**: camelCase (e.g., `handleSubmit`, `fetchProducts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_ITEMS`)
- **Types/Interfaces**: PascalCase (e.g., `Product`, `User`, `OrderItem`)
- **Props Types**: PascalCase with 'Props' suffix (e.g., `ProductCardProps`)

## Component Structure

### Functional Component Template
```typescript
import React, { useState, useEffect } from 'react';
import { ComponentIcon } from 'lucide-react';
import type { ComponentProps } from './types';

interface ComponentNameProps {
  // Props definition
  title: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

const ComponentName: React.FC<ComponentNameProps> = ({ 
  title, 
  onAction,
  children 
}) => {
  // State
  const [state, setState] = useState<string>('');

  // Effects
  useEffect(() => {
    // Side effects
  }, []);

  // Handlers
  const handleClick = () => {
    // Logic
    onAction?.();
  };

  // Render
  return (
    <div className="container">
      <h2 className="text-xl font-bold">{title}</h2>
      {children}
    </div>
  );
};

export default ComponentName;
```

### Component Rules
1. **One component per file**
2. **Export default** at the end
3. **TypeScript for all components**
4. **Props interface** defined inline or imported
5. **Destructure props** in function signature
6. **Group hooks** - state, effects, callbacks
7. **Extract complex logic** to custom hooks
8. **Memoize expensive computations** with useMemo
9. **Memoize callbacks** with useCallback when needed

## Page Structure

### Page Component Template
```typescript
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../features/hooks';
import { fetchProducts } from '../features/product/productSlice';
import ProductCard from '../components/Product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector(state => state.product);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductListPage;
```

### Page Rules
1. **One page per route**
2. **Fetch data in useEffect**
3. **Handle loading states**
4. **Handle error states**
5. **Use layouts** for consistent structure
6. **Responsive design** - mobile-first
7. **SEO-friendly** - proper titles, meta tags

## Component Categories

### Common Components (Shared)
- **UI Elements**: Button, Input, Select, Checkbox, Radio
- **Feedback**: LoadingSpinner, ErrorMessage, Toast, Modal
- **Layout**: Container, Card, Grid, Flex
- **Navigation**: Navbar, Sidebar, Breadcrumb, Tabs
- **Data Display**: Table, List, Badge, Avatar
- **Forms**: FormField, FormGroup, FormError

### Feature Components
- **Product**: ProductCard, ProductFilter, ProductDetails
- **Cart**: CartItem, CartSummary, CartDrawer
- **Order**: OrderCard, OrderTimeline, OrderStatus
- **User**: UserProfile, UserAvatar, UserMenu
- **Address**: AddressCard, AddressForm, AddressSelector

## State Management

### Redux Slice Template
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productService } from '../../services/product.service';
import type { Product } from '../../types/product.types';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product>) => {
      state.selectedProduct = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedProduct, clearError } = productSlice.actions;
export default productSlice.reducer;
```

### State Management Rules
1. **Redux for global state** - auth, cart, products
2. **Context for feature state** - address, checkout
3. **Local state for UI** - modals, dropdowns, forms
4. **Async thunks** for API calls
5. **Normalize data** when possible
6. **Immutable updates** - use Redux Toolkit
7. **Selectors** for derived state

## Service Layer

### Service Template
```typescript
import http from './http';
import type { Product, CreateProductRequest } from '../types/product.types';

const PRODUCT_BASE_URL = '/product';

export const productService = {
  getAll: async (filters?: any): Promise<{ data: Product[] }> => {
    const response = await http.post(`${PRODUCT_BASE_URL}/getAll`, filters);
    return response;
  },

  getById: async (id: string): Promise<{ data: Product }> => {
    const response = await http.get(`${PRODUCT_BASE_URL}/${id}`);
    return response;
  },

  create: async (data: CreateProductRequest): Promise<{ data: Product }> => {
    const response = await http.post(PRODUCT_BASE_URL, data);
    return response;
  },

  update: async (id: string, data: Partial<Product>): Promise<void> => {
    return http.put(`${PRODUCT_BASE_URL}/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return http.delete(`${PRODUCT_BASE_URL}/deleteByFilter`, { data: { _id: id } });
  },
};
```

### HTTP Client (Axios)
```typescript
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/customer',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ACCESS_TOKEN');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### Service Rules
1. **One service per entity**
2. **Export service object** with methods
3. **Type all requests/responses**
4. **Handle errors** in interceptors
5. **Use base URLs** from environment
6. **Consistent method names** - getAll, getById, create, update, delete

## Routing

### Route Configuration
```typescript
export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRODUCTS: {
    ROOT: '/products',
    DETAILS: '/products/:id',
  },
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAILS: '/orders/:id',
  PROFILE: '/profile',
};
```

### Protected Route Component
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../features/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
```

### Routing Rules
1. **Centralized route config**
2. **Protected routes** for authenticated pages
3. **Lazy loading** for code splitting
4. **404 page** for unknown routes
5. **Redirect after login**
6. **Breadcrumbs** for navigation context

## Styling (Tailwind CSS)

### Tailwind Best Practices
1. **Use utility classes** - avoid custom CSS when possible
2. **Responsive design** - mobile-first with breakpoints
3. **Consistent spacing** - use Tailwind spacing scale
4. **Color palette** - define in tailwind.config.js
5. **Component classes** - extract repeated patterns
6. **Dark mode** - use dark: variants

### Common Patterns
```typescript
// Card
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">

// Button Primary
<button className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors">

// Input
<input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />

// Grid Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Flex Center
<div className="flex items-center justify-center">
```

## Form Handling

### Form Component Template
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  email: string;
}

const MyForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof FormData]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // API call
      toast.success('Success!');
      navigate('/success');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default MyForm;
```

### Form Rules
1. **Controlled components** - use state for inputs
2. **Client-side validation** before submit
3. **Show errors** inline below fields
4. **Disable submit** during loading
5. **Toast notifications** for feedback
6. **Clear errors** on input change
7. **Handle API errors** gracefully

## UI/UX Best Practices

### Loading States
```typescript
{loading && <LoadingSpinner />}
{!loading && data && <DataDisplay data={data} />}
{!loading && !data && <EmptyState />}
```

### Error Handling
```typescript
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}
```

### Empty States
```typescript
{items.length === 0 && (
  <div className="text-center py-12">
    <Icon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">No items</h3>
    <p className="mt-1 text-sm text-gray-500">Get started by creating a new item.</p>
    <button className="mt-6">Create Item</button>
  </div>
)}
```

### Modals
```typescript
{isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h2 className="text-xl font-bold mb-4">Modal Title</h2>
      {/* Content */}
      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    </div>
  </div>
)}
```

## Performance Optimization

1. **Code splitting** - lazy load routes
2. **Memoization** - React.memo for expensive components
3. **Virtual scrolling** - for long lists
4. **Image optimization** - lazy loading, WebP format
5. **Debounce** - search inputs
6. **Pagination** - don't load all data at once
7. **Cache API responses** - in Redux or React Query

## Accessibility

1. **Semantic HTML** - use proper tags
2. **ARIA labels** - for screen readers
3. **Keyboard navigation** - tab, enter, escape
4. **Focus management** - visible focus states
5. **Alt text** - for images
6. **Color contrast** - WCAG AA compliance
7. **Form labels** - associate with inputs

## TypeScript Best Practices

1. **Type everything** - no 'any' unless necessary
2. **Interface for objects** - clear contracts
3. **Type for unions** - flexibility
4. **Generics** - reusable components
5. **Strict mode** - enabled in tsconfig
6. **Enums** - for constants with meaning
7. **Type guards** - for runtime checks

## Testing (When Implemented)

1. **Unit tests** - components, hooks, utils
2. **Integration tests** - user flows
3. **E2E tests** - critical paths
4. **Mock API calls** - consistent test data
5. **Test user interactions** - clicks, typing
6. **Accessibility tests** - a11y compliance

## Git Workflow

```
feat: Add product search functionality
fix: Fix cart total calculation
refactor: Refactor product card component
style: Update button styles
docs: Update component documentation
test: Add tests for cart functionality
```

## Environment Variables

```env
VITE_API_URL=http://localhost:3000/api/v1/customer
VITE_APP_NAME=My App
VITE_ENABLE_ANALYTICS=true
```

Access with: `import.meta.env.VITE_API_URL`

## Build & Deployment

```bash
npm run dev      # Development
npm run build    # Production build
npm run preview  # Preview production build
```

### Build Optimization
1. **Tree shaking** - remove unused code
2. **Minification** - compress code
3. **Code splitting** - lazy loading
4. **Asset optimization** - compress images
5. **CDN** - serve static assets
