# Kipi Core App - Comprehensive System Analysis

## Table of Contents
1. [System Overview](#system-overview)
2. [Backend Architecture](#backend-architecture)
3. [Customer Application](#customer-application)
4. [Admin Application](#admin-application)
5. [Technology Stack](#technology-stack)
6. [Module Analysis](#module-analysis)

---

## System Overview

**Kipi Core App** is a full-stack e-commerce platform consisting of three main applications:

- **Backend API** (Node.js/Express/TypeScript)
- **Customer App** (React/TypeScript/Vite)
- **Admin App** (React/TypeScript/Vite)

### Architecture Pattern
- **Backend**: RESTful API with layered architecture (Controllers → Services → Models)
- **Frontend**: Component-based SPA with Redux state management
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with access/refresh tokens

---

## Backend Architecture

### Technology Stack
```json
{
  "runtime": "Node.js",
  "framework": "Express 5.1.0",
  "language": "TypeScript 5.9.3",
  "database": "MongoDB (Mongoose 8.19.0)",
  "cache": "Redis (ioredis 5.9.0)",
  "queue": "BullMQ 5.66.4",
  "validation": "Zod 4.2.1",
  "authentication": "JWT (jsonwebtoken 9.0.2)"
}
```

### Project Structure
```
backend/src/
├── configs/          # Environment and configuration
├── constants/        # Enums, status codes, messages (26 files)
├── controllers/      # Request handlers (29 controllers)
├── db/mongodb/       # Database models and seeders
│   └── models/       # Mongoose schemas (34 models)
├── helpers/          # Utility functions (8 helpers)
├── interfaces/       # TypeScript interfaces (28 files)
├── jobs/             # Background job processors (6 jobs)
├── middlewares/      # Express middleware (6 middlewares)
├── routes/           # API route definitions
│   ├── admin/        # Admin-specific routes (27 routes)
│   ├── customer/     # Customer-specific routes (14 routes)
│   └── common/       # Shared routes (1 route)
├── scripts/          # Utility scripts (3 scripts)
├── services/         # Business logic layer
│   ├── concrete/     # Service implementations (41 services)
│   └── contracts/    # Service interfaces
├── tests/            # Test files (5 tests)
├── types/            # Type definitions (20 files)
└── validators/       # Request validation (23 validators)
```

### Core Database Models (34 Total)

#### E-commerce Core
- **Product Management**: `productModel`, `skuModel`, `categoryModel`, `attributeModel`
- **Inventory**: `lotModel`, `stockLedgerModel`, `warehouseModel`
- **Orders**: `orderModel`, `cartModel`, `wishlistModel`
- **Customer**: `userModel`, `addressModel`, `reviewModel`
- **Promotions**: `couponModel`, `loyaltyTransactionModel`

#### Logistics & Fulfillment
- **Shipping**: `shipmentModel`, `courierModel`, `trackingEventModel`
- **Returns**: `returnModel`, `exchangeModel`, `ndrModel` (Non-Delivery Report)
- **RTO**: `rtoModel`, `rtoScoreModel` (Return to Origin)

#### Financial
- **Ledgers**: `codLedgerModel`, `refundLedgerModel`

#### System & Infrastructure
- **Authentication**: `authTokenModel`, `otpModel`, `authActionHistoryModel`
- **Files**: `fileStorageModel`, `fileDirectoryModel`, `presignedUrlModel`
- **Automation**: `cronJobModel`, `webhookLogModel`
- **Communication**: `whatsAppSessionModel`

### Service Layer Architecture

All services extend `MongooseCommonService` which provides:
- **CRUD Operations**: `create`, `findAll`, `findOne`, `findById`, `update`, `delete`
- **Advanced Queries**: `findAllWithPagination`, `aggregate`, `count`
- **Filter Generation**: Dynamic query builder from request parameters
- **Soft Delete**: Audit trail with `deletedAt`, `deletedBy`

#### Key Services (41 Total)

**Core Business Logic**:
- `orderService` - Order lifecycle management, logistics integration
- `productService` - Product catalog, inventory checks
- `cartService` - Shopping cart operations
- `couponService` - Discount validation and application
- `reviewService` - Product reviews and ratings

**Logistics**:
- `logisticsService` - Shipment creation, tracking
- `trackingService` - Real-time tracking updates
- `etaService` - Estimated delivery time calculation
- `ndrService` - Non-delivery report handling
- `rtoService` - Return to origin processing

**Financial**:
- `codLedgerService` - Cash on delivery tracking
- `refundLedgerService` - Refund processing

**Analytics**:
- `analyticsService` - Business intelligence, reporting
- `exportService` - Data export (Excel, CSV)

**Infrastructure**:
- `authService` - Authentication, token management
- `fileStorageService` - S3/Cloudinary file uploads
- `whatsAppService` - WhatsApp messaging integration
- `webhookService` - External webhook handling
- `cronJobService` - Scheduled task management

### Controller Layer (29 Controllers)

Controllers handle HTTP requests and responses:
- Validate input using Zod validators
- Call appropriate service methods
- Format responses with standard structure
- Handle errors via middleware

**Standard Response Format**:
```typescript
{
  status: number,      // HTTP status code
  code: string,        // Application code
  message: string,     // User-friendly message
  data?: any          // Response payload
}
```

### API Routes

#### Customer Routes (`/api/v1/customer`)
- `/auth` - Login, register, OTP verification
- `/product` - Product catalog, search
- `/category` - Category browsing
- `/cart` - Cart management
- `/wishlist` - Wishlist operations
- `/review` - Product reviews
- `/address` - Address CRUD
- `/coupon` - Coupon validation
- `/sku` - SKU details
- `/order` - Order placement, tracking
- `/loyalty` - Loyalty points
- `/return` - Return requests
- `/attribute` - Product attributes
- `/eta` - Delivery estimates

#### Admin Routes (`/api/v1/admin`)
All customer routes plus:
- `/user` - User management
- `/analytics` - Business analytics
- `/shipment` - Shipment management
- `/warehouse` - Warehouse operations
- `/courier` - Courier configuration
- `/lot` - Inventory lot management
- `/stock-ledger` - Stock movements
- `/rto-score` - RTO risk scoring
- `/ndr` - NDR dashboard
- `/cron-job` - Cron job management
- `/whatsapp` - WhatsApp integration
- `/file-storage` - File management
- `/webhook` - Webhook configuration

### Middleware Stack
1. **jwtAuth** - JWT token validation, user attachment
2. **errorHandler** - Centralized error handling
3. **zodValidator** - Request validation
4. **rateLimiter** - API rate limiting
5. **cors** - Cross-origin resource sharing
6. **compression** - Response compression

### Background Jobs (BullMQ)
- Email notifications
- WhatsApp messages
- Order status updates
- Inventory synchronization
- Analytics aggregation
- Scheduled reports

---

## Customer Application

### Technology Stack
```json
{
  "framework": "React 19.2.0",
  "bundler": "Vite 7.2.4",
  "language": "TypeScript 5.9.3",
  "state": "Redux Toolkit 2.11.2",
  "routing": "React Router 7.11.0",
  "styling": "Tailwind CSS 4.1.18",
  "http": "Axios 1.13.2",
  "ui": "Lucide React 0.562.0"
}
```

### Project Structure
```
customer/src/
├── assets/           # Static assets
├── components/       # Reusable components (11 groups)
│   ├── Address/      # Address cards, forms
│   ├── Cart/         # Cart items, summary
│   ├── Footer/       # Footer component
│   ├── Navbar/       # Navigation, search
│   ├── Product/      # Product cards, filters
│   ├── Review/       # Review forms, lists
│   ├── Wishlist/     # Wishlist items
│   ├── common/       # Shared UI (buttons, modals, inputs)
│   └── return/       # Return request forms
├── context/          # React Context providers (5 contexts)
│   ├── AddressContext
│   ├── CartContext
│   ├── CheckoutContext
│   ├── ProductContext
│   └── WishlistContext
├── features/         # Redux slices (10 slices)
│   ├── auth/
│   ├── cart/
│   ├── category/
│   ├── checkout/
│   ├── coupon/
│   ├── loyalty/
│   ├── order/
│   ├── product/
│   ├── review/
│   └── wishlist/
├── hooks/            # Custom React hooks (2 hooks)
├── layouts/          # Page layouts
├── pages/            # Page components (12 modules)
│   ├── Address/      # Manage addresses
│   ├── Auth/         # Login, register, OTP, password reset
│   ├── Cart/         # Shopping cart
│   ├── Checkout/     # Checkout flow
│   ├── Dashboard/    # User dashboard
│   ├── Home/         # Homepage
│   ├── Order/        # Order details, invoice, tracking
│   ├── Orders/       # Order history
│   ├── Products/     # Product listing, details
│   ├── Profile/      # User profile, settings
│   └── Wishlist/     # Wishlist page
├── routes/           # Route configuration
├── services/         # API service layer (13 services)
│   ├── address.service
│   ├── auth.service
│   ├── cart.service
│   ├── category.service
│   ├── checkout.service
│   ├── coupon.service
│   ├── http (Axios instance)
│   ├── loyalty.service
│   ├── order.service
│   ├── product.service
│   ├── review.service
│   ├── return.service
│   └── wishlist.service
├── types/            # TypeScript types (9 type files)
└── utils/            # Utility functions (2 utils)
```

### Key Features

#### Authentication Flow
1. **Login/Register** - Email/mobile with OTP verification
2. **JWT Storage** - Access token in localStorage
3. **Protected Routes** - `ProtectedRoute` component wrapper
4. **Auto Logout** - 401 response triggers logout

#### State Management (Redux)
- **Auth Slice**: User session, login state
- **Cart Slice**: Cart items, quantities, totals
- **Product Slice**: Product catalog, filters
- **Checkout Slice**: Checkout state, selected address
- **Order Slice**: Order history, tracking

#### Context Providers
- **AddressContext**: Address CRUD, default address
- **CartContext**: Cart operations, sync with backend
- **CheckoutContext**: Checkout flow state
- **ProductContext**: Product browsing, filters
- **WishlistContext**: Wishlist management

#### Page Modules

**Public Pages**:
- Home - Hero, featured products, categories
- Products - Listing with filters, search, pagination
- Product Details - Images, specs, reviews, add to cart

**Authenticated Pages**:
- Cart - Items, quantity adjustment, coupon application
- Checkout - Address selection, payment method, order summary
- Orders - Order history with filters
- Order Details - Tracking, invoice download, return request
- Profile - Personal info, password change
- Addresses - Manage delivery addresses
- Wishlist - Saved products
- Loyalty - Points balance, transaction history

### Component Architecture

**Common Components**:
- `Button`, `Input`, `Modal`, `Dropdown`, `Badge`
- `LoadingSpinner`, `ErrorMessage`, `EmptyState`
- `Pagination`, `SearchBar`, `FilterPanel`

**Feature Components**:
- `ProductCard` - Product display with quick actions
- `CartItem` - Cart line item with quantity controls
- `AddressCard` - Address display with edit/delete
- `ReviewCard` - Customer review with rating
- `OrderCard` - Order summary card
- `ReturnRequestModal` - Return/exchange form

### Routing Structure
```typescript
/ - Home
/products - Product listing
/products/:id - Product details
/cart - Shopping cart
/checkout - Checkout
/orders - Order history
/orders/:id - Order details
/invoice/:id - Invoice view
/profile - User profile
/addresses - Address management
/wishlist - Wishlist
/loyalty - Loyalty program
/returns - Return requests
```

---

## Admin Application

### Technology Stack
```json
{
  "framework": "React 19.2.0",
  "bundler": "Vite 7.2.4",
  "language": "TypeScript 5.9.3",
  "state": "Redux Toolkit 2.11.2",
  "routing": "React Router 7.11.0",
  "styling": "Tailwind CSS 4.1.18",
  "charts": "Recharts 3.6.0",
  "tabs": "React Tabs 6.1.0",
  "http": "Axios 1.13.2"
}
```

### Project Structure
```
admin/src/
├── components/       # Reusable components (8 groups)
│   ├── Navbar/
│   ├── Sidebar/      # Navigation sidebar
│   ├── common/       # Tables, forms, charts
│   ├── logistics/    # Shipment tracking, NDR
│   ├── lot/          # Inventory lot management
│   ├── order/        # Order management
│   └── return/       # Return processing
├── context/          # React Context (1 context)
├── features/         # Redux slices (8 slices)
│   ├── analytics/
│   ├── auth/
│   ├── category/
│   ├── coupon/
│   ├── order/
│   ├── product/
│   ├── shipment/
│   └── user/
├── pages/            # Page components (27 modules)
│   ├── Analytics/    # 7 analytics dashboards
│   ├── Attribute/
│   ├── Category/
│   ├── Coupon/
│   ├── Courier/
│   ├── CronJob/
│   ├── Dashboard/
│   ├── FileStorage/
│   ├── Inventory/
│   ├── Lot/
│   ├── Loyalty/
│   ├── NDR/
│   ├── Orders/
│   ├── Product/
│   ├── Profile/
│   ├── Return/
│   ├── Review/
│   ├── RTO/
│   ├── Shipment/
│   ├── SKU/
│   ├── User/
│   ├── Warehouse/
│   └── WhatsApp/
├── routes/           # Route configuration
├── services/         # API services (23 services)
└── types/            # TypeScript types (20 type files)
```

### Key Features

#### Dashboard Modules

**Product Management**:
- Products - CRUD, bulk operations, variants
- SKUs - Stock keeping units, pricing, inventory
- Categories - Hierarchical category management
- Attributes - Product attributes (size, color, etc.)
- Reviews - Review moderation, responses

**Order Management**:
- Orders - Order processing, status updates
- Shipments - Shipment tracking, courier assignment
- Returns - Return/exchange processing
- NDR - Non-delivery report handling
- RTO - Return to origin management

**Customer Management**:
- Users - Customer accounts, roles, permissions
- Loyalty - Loyalty program configuration
- Coupons - Discount code management

**Inventory Management**:
- Lots - Inventory lot tracking
- Stock Ledger - Stock movement history
- Warehouses - Warehouse configuration

**Logistics**:
- Courier Config - Courier integration settings
- Shipment Tracking - Real-time tracking
- RTO Dashboard - Return analytics
- NDR Dashboard - Non-delivery analytics

**Analytics (Intelligence)**:
- Sales Analytics - Revenue, trends, forecasts
- Product Analytics - Best sellers, inventory turnover
- Customer Analytics - Acquisition, retention, LTV
- Financial Analytics - Profit margins, expenses
- Lot Analytics - Inventory performance
- Logistics Analytics - Delivery performance
- Courier Analytics - Courier comparison

**System**:
- File Manager - Asset management
- Cron Hub - Scheduled task management
- WhatsApp - Messaging configuration

### Component Architecture

**Common Components**:
- `DataTable` - Sortable, filterable tables with pagination
- `StatCard` - Metric display cards
- `Chart` - Recharts wrapper (line, bar, pie)
- `FormBuilder` - Dynamic form generation
- `Modal`, `Drawer`, `Tabs`
- `DateRangePicker`, `MultiSelect`, `SearchableDropdown`

**Logistics Components**:
- `ShipmentTracker` - Visual tracking timeline
- `NDRActionPanel` - NDR resolution actions
- `CourierSelector` - Courier selection with rates

**Order Components**:
- `OrderStatusTimeline` - Order status progression
- `OrderItemsTable` - Order line items
- `InvoiceGenerator` - Invoice creation

### Routing Structure
```typescript
/dashboard - Main dashboard
/dashboard/products - Product management
/dashboard/skus - SKU management
/dashboard/orders - Order management
/dashboard/shipments - Shipment tracking
/dashboard/returns - Return processing
/dashboard/users - User management
/dashboard/categories - Category management
/dashboard/coupons - Coupon management
/dashboard/warehouses - Warehouse config
/dashboard/courier-config - Courier settings
/dashboard/intelligence/* - Analytics dashboards
```

---

## Technology Stack Summary

### Backend
| Category | Technology | Version |
|----------|-----------|---------|
| Runtime | Node.js | Latest |
| Framework | Express | 5.1.0 |
| Language | TypeScript | 5.9.3 |
| Database | MongoDB | - |
| ODM | Mongoose | 8.19.0 |
| Cache | Redis (ioredis) | 5.9.0 |
| Queue | BullMQ | 5.66.4 |
| Validation | Zod | 4.2.1 |
| Auth | jsonwebtoken | 9.0.2 |
| File Storage | AWS S3, Cloudinary | - |
| Email | Nodemailer | 7.0.9 |
| Messaging | WhatsApp Web.js | 1.34.2 |
| Logging | Winston | 3.18.3 |
| Cron | node-cron | 4.2.1 |

### Frontend (Both Apps)
| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React | 19.2.0 |
| Bundler | Vite | 7.2.4 |
| Language | TypeScript | 5.9.3 |
| State | Redux Toolkit | 2.11.2 |
| Routing | React Router | 7.11.0 |
| Styling | Tailwind CSS | 4.1.18 |
| HTTP | Axios | 1.13.2 |
| Icons | Lucide React | 0.562.0 |
| Notifications | React Hot Toast | 2.6.0 |
| Date Utils | date-fns | 4.1.0 |

### Admin-Specific
| Category | Technology | Version |
|----------|-----------|---------|
| Charts | Recharts | 3.6.0 |
| Tabs | React Tabs | 6.1.0 |
| Query String | qs | 6.14.1 |

---

## Module Analysis

### Backend Modules

#### Authentication Module
**Files**: `authController`, `authService`, `jwtAuth` middleware
**Features**:
- Email/mobile registration with OTP
- JWT access/refresh token flow
- Password reset via OTP
- Session management
- Role-based access control

#### Product Module
**Models**: `productModel`, `skuModel`, `categoryModel`, `attributeModel`
**Services**: `productService`, `skuService`, `categoryService`, `attributeService`
**Features**:
- Product catalog management
- Variant/SKU handling
- Category hierarchy
- Dynamic attributes
- Inventory tracking
- Image management

#### Order Module
**Models**: `orderModel`, `cartModel`
**Services**: `orderService`, `cartService`
**Features**:
- Cart to order conversion
- Order lifecycle management
- Payment integration
- Order status tracking
- Invoice generation

#### Logistics Module
**Models**: `shipmentModel`, `courierModel`, `trackingEventModel`, `ndrModel`, `rtoModel`
**Services**: `logisticsService`, `trackingService`, `etaService`, `ndrService`, `rtoService`
**Features**:
- Multi-courier integration
- Real-time tracking
- ETA calculation
- NDR management
- RTO processing
- Delivery optimization

#### Return Module
**Models**: `returnModel`, `exchangeModel`
**Services**: `returnService`, `exchangeService`
**Features**:
- Return request processing
- Exchange handling
- Refund management
- Quality check workflow

#### Analytics Module
**Service**: `analyticsService`
**Features**:
- Sales analytics
- Product performance
- Customer insights
- Financial reports
- Logistics metrics
- Custom date ranges
- Export to Excel

### Customer App Modules

#### Shopping Module
**Pages**: Home, Products, Product Details, Cart
**Components**: ProductCard, ProductFilter, CartItem
**Features**:
- Product browsing with filters
- Search functionality
- Add to cart
- Wishlist
- Product reviews

#### Checkout Module
**Pages**: Checkout, Order Success
**Context**: CheckoutContext, AddressContext
**Features**:
- Address selection
- Coupon application
- Payment method selection
- Order summary
- Order placement

#### Order Management Module
**Pages**: Orders, Order Details, Invoice
**Features**:
- Order history
- Order tracking
- Invoice download
- Return requests

#### Profile Module
**Pages**: Profile, Addresses, Change Password
**Features**:
- Profile management
- Address CRUD
- Password change
- Loyalty points

### Admin App Modules

#### Product Management Module
**Pages**: Products, SKUs, Categories, Attributes
**Features**:
- Bulk product upload
- Variant management
- Category tree
- Attribute configuration
- Inventory sync

#### Order Processing Module
**Pages**: Orders, Order Details
**Features**:
- Order dashboard
- Status updates
- Bulk operations
- Order analytics
- Invoice generation

#### Logistics Module
**Pages**: Shipments, Courier Config, Warehouses, NDR, RTO
**Features**:
- Shipment creation
- Courier assignment
- Warehouse management
- NDR resolution
- RTO analytics

#### Analytics Module
**Pages**: 7 analytics dashboards
**Features**:
- Sales trends
- Product performance
- Customer analytics
- Financial metrics
- Logistics KPIs
- Interactive charts
- Date range filters
- Export reports

---

## Security Features

### Backend
- JWT-based authentication
- Password hashing with bcrypt
- Request validation with Zod
- Rate limiting
- CORS configuration
- SQL injection prevention (Mongoose)
- XSS protection
- Helmet.js headers

### Frontend
- Protected routes
- Token refresh mechanism
- Secure token storage
- Input sanitization
- HTTPS enforcement
- CSRF protection

---

## Deployment Architecture

### Backend
- **Server**: Node.js process
- **Database**: MongoDB Atlas/Self-hosted
- **Cache**: Redis
- **Queue**: Redis + BullMQ
- **File Storage**: AWS S3 / Cloudinary
- **Logging**: Winston with daily rotation

### Frontend
- **Build**: Vite production build
- **Hosting**: Static file hosting (Vercel, Netlify, S3)
- **CDN**: CloudFront, Cloudflare
- **Environment**: `.env` for API URLs

---

## Development Workflow

### Backend
```bash
npm run dev      # Development with hot reload
npm run build    # TypeScript compilation
npm run start    # Production server
npm run seed     # Database seeding
npm run lint     # ESLint
```

### Frontend (Customer/Admin)
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

---

## API Standards

### Request Format
```typescript
// Query parameters for filtering
GET /api/v1/customer/product/getAll?status=ACTIVE&page=1&limit=10

// Body for mutations
POST /api/v1/customer/order
{
  "items": [...],
  "addressId": "...",
  "paymentMethod": "COD"
}
```

### Response Format
```typescript
{
  "status": 200,
  "code": "SUCCESS",
  "message": "Products fetched successfully",
  "data": {
    "recordList": [...],
    "totalRecords": 100,
    "currentPage": 1,
    "totalPages": 10
  }
}
```

### Error Format
```typescript
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "errors": [...]
}
```

---

## Conclusion

The Kipi Core App is a comprehensive e-commerce platform with:
- **34 database models** covering all e-commerce aspects
- **41 backend services** with robust business logic
- **29 controllers** handling API requests
- **Customer app** with 12 page modules and 11 component groups
- **Admin app** with 27 page modules and 8 component groups
- **Full logistics integration** with tracking, NDR, RTO
- **Advanced analytics** with 7 intelligence dashboards
- **Modern tech stack** with TypeScript, React 19, Vite, Tailwind

The architecture follows best practices with clear separation of concerns, type safety, and scalability.
