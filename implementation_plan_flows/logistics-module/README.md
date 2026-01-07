# Logistics Module - Enterprise Order Ecosystem

## Overview
Enterprise-grade logistics and order management system with Shiprocket integration, designed to handle 1M+ orders/month with advanced RTO reduction, ETA calculation, and complete order lifecycle management.

## Purpose
Transform the e-commerce platform with:
- **Courier-agnostic logistics** - Abstract provider layer for multi-courier support
- **RTO reduction** - Intelligent scoring to reduce RTO from 25-30% to <10%
- **Accurate ETAs** - ML-based delivery estimates with 80%+ accuracy
- **Real-time tracking** - Webhook-driven order status updates
- **Automated workflows** - Event-driven architecture for inventory, loyalty, refunds

## Scope

### In Scope
1. **Shiprocket Integration** - Complete API wrapper with authentication, rate limiting
2. **Order Lifecycle** - Order → Shipment → Delivery/RTO → Refund
3. **RTO Management** - Scoring engine, QC workflow, stock reversion
4. **NDR Handling** - Non-delivery report resolution
5. **Warehouse Management** - Multi-warehouse fulfillment
6. **Courier Management** - Provider configuration, performance tracking
7. **ETA Calculation** - Historical data analysis, confidence ranges
8. **Webhook Processing** - Async event handling, normalization
9. **Refund Automation** - Ledger-based refund tracking
10. **COD Settlement** - COD ledger and reconciliation
11. **Notifications** - WhatsApp + Email for all order events
12. **Admin Dashboard** - 6 management modules
13. **Customer Portal** - Order tracking, returns/exchanges

### Out of Scope
- Multi-currency support (future)
- International shipping (future)
- Custom courier integrations beyond Shiprocket (future)
- Inventory forecasting (future)

## Key Features

### 1. **Courier-Agnostic Architecture**
- `ICourierProvider` interface for provider abstraction
- Easy addition of new courier providers
- Fallback mechanisms for provider failures

### 2. **RTO Reduction Engine**
**Formula**: 
```
RTO_RISK_SCORE = (
  CUSTOMER_SCORE × 40% +
  PINCODE_SCORE × 30% +
  COURIER_SCORE × 20% +
  ORDER_SCORE × 10%
) × 100
```
**Impact**: Reduce RTO from 25-30% to <10%

### 3. **ETA Calculation Engine**
**Formula**:
```
ETA_DAYS = (
  COURIER_SLA × 40% +
  HISTORICAL_AVG × 35% +
  DISTANCE_FACTOR × 15% +
  SEASONAL_ADJUSTMENT × 10%
)
```
**Accuracy**: 80%+ with confidence ranges

### 4. **Event-Driven Architecture**
- Order events trigger inventory updates
- Automatic loyalty point adjustments
- Coupon reversal on cancellation/RTO
- Real-time notification dispatch

### 5. **Webhook Processing**
- Signature verification
- Idempotency handling
- Async queue processing (Bull/BullMQ)
- Event normalization across providers

## Dependencies

### Backend Dependencies
- **Bull/BullMQ** - Queue processing
- **Redis** - Cache and queue storage
- **Axios** - HTTP client for courier APIs
- **Zod** - Validation
- **Crypto** - Webhook signature verification
- **Mongoose** - MongoDB ODM

### Frontend Dependencies
- **React Hook Form** - Form management
- **Zod** - Validation
- **@hookform/resolvers** - Zod integration
- **React Query** (optional) - Data fetching
- **Recharts** - Analytics charts

### External Services
- **Shiprocket API** - Primary courier provider
- **WhatsApp Business API** - Notifications
- **Email Service** (Nodemailer) - Email notifications

## Architecture Overview

### System Flow
```
Order Creation → RTO Scoring → Shipment Creation → Courier Assignment
     ↓                                    ↓
Stock Reserve                      Webhook Events
     ↓                                    ↓
Payment                           Tracking Updates
     ↓                                    ↓
Fulfillment                       Delivery/RTO/NDR
     ↓                                    ↓
Shipment                          Stock Reversion
     ↓                                    ↓
Delivery                          Refund Processing
```

### Component Architecture
```
┌─────────────────────────────────────────────┐
│           Frontend (Admin/Customer)         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          API Gateway (Express)              │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      Controllers (Validation Layer)         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│     Services (Business Logic Layer)         │
│  ┌──────────────────────────────────────┐  │
│  │  LogisticsService (Orchestrator)     │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼──────────┐  ┌──────────┐ │
│  │ ShiprocketProvider      │  │ RTOScore │ │
│  └─────────────────────────┘  └──────────┘ │
│  ┌─────────────────────────┐  ┌──────────┐ │
│  │ WebhookProcessor        │  │ ETACalc  │ │
│  └─────────────────────────┘  └──────────┘ │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│       Event Emitter (OrderEvents)           │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│    Queue Processors (Bull/BullMQ)           │
│  - Webhook Processing                       │
│  - Notification Dispatch                    │
│  - Inventory Updates                        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Database (MongoDB)                  │
│  17 Models + Extended Models                │
└─────────────────────────────────────────────┘
```

## Related Modules
- **Order Module** - Extended with shipment, RTO, NDR fields
- **Inventory Module** - Stock reservation, RTO reversion
- **Loyalty Module** - Point reversal on RTO
- **Coupon Module** - Coupon reversal on cancellation
- **Refund Module** - Automated refund processing
- **Notification Module** - WhatsApp + Email integration

## Status
- **Current Status**: Planning Complete
- **Version**: 1.0.0
- **Last Updated**: 2026-01-07
- **Design Completion**: 2026-01-06
- **Implementation Timeline**: 12 weeks

## Team
- **Owner**: Development Team
- **Contributors**: Backend Team, Frontend Team, DevOps

## Documentation
- [Implementation Plan](./implementation-plan.md) - 12-week roadmap
- [API Flows](./api-flows.md) - 40+ endpoints
- [UI Flows](./ui-flows.md) - Admin + Customer modules
- [Database Schema](./database-schema.md) - 17 models
- [Testing Plan](./testing-plan.md) - Complete testing strategy

## Success Metrics

### Operational
- RTO Rate: <10% (from 25-30%)
- ETA Accuracy: >80%
- Webhook Processing: <5s average
- API Response Time: <500ms

### Financial
- RTO Cost Savings: ₹200-300 per prevented RTO
- Refund Automation: 100% (from manual)
- COD Settlement: Automated tracking

### Customer Experience
- Real-time tracking updates
- Accurate delivery estimates
- Proactive NDR resolution
- Faster refunds (automated)

## Implementation Phases

### Phase 1-2: Foundation & Architecture (Weeks 1-2)
- MongoDB models
- Redis setup
- Bull/BullMQ configuration
- Core architecture patterns

### Phase 3-4: Shiprocket Integration (Weeks 3-4)
- API wrapper
- Webhook processing
- Event-driven architecture

### Phase 5-6: Advanced Engines (Weeks 5-6)
- RTO scoring
- ETA calculation
- Historical data collection

### Phase 7-8: Backend APIs (Weeks 7-8)
- 40+ endpoints
- Validators
- Controllers & Services

### Phase 9-10: Frontend (Weeks 9-10)
- Admin modules (6)
- Customer modules (2)
- Form validation

### Phase 11: Notifications (Week 11)
- 8 notification templates
- WhatsApp + Email integration

### Phase 12: Testing & Deployment (Week 12)
- Unit, integration, E2E tests
- UAT
- Production deployment
