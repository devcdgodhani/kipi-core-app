# Dynamic Payment Gateway Module

## Module Overview

The **Dynamic Payment Gateway Module** enables the Kipi Core App to integrate multiple payment gateways (PhonePe, Razorpay, Paytm) in a flexible, admin-managed architecture. This module transforms the current basic payment handling into a robust, production-ready payment system.

## Purpose

Enable seamless online payments through multiple gateways while maintaining:
- **Admin Control**: Dynamic gateway configuration without code changes
- **Security**: PCI-DSS compliant, encrypted credentials, webhook verification
- **Backward Compatibility**: Existing COD and order flows remain unchanged
- **Extensibility**: Easy addition of new gateways in the future
- **Reliability**: Webhook-based synchronization with proper idempotency

## Current System State

### Existing Payment Features
- **Order Model**: Tracks `paymentMethod` (COD/ONLINE) and `paymentStatus` (PENDING, COMPLETED, FAILED, REFUNDED)
- **Refund Ledger**: Comprehensive refund tracking with `paymentGateway` and `transactionId` fields (already prepared for gateway integration)
- **Webhook Infrastructure**:existing `WebhookLogModel` tracking provider, eventType, payload
- **Checkout Flow**: Customer app supports COD and ONLINE selection
- **Admin Refund UI**: Existing refund management interface

### Gaps to Address
- No actual payment gateway integrations (PhonePe, Razorpay, Paytm)
- No `payments` table to track individual payment transactions
- No gateway configuration management in admin
- No payment initiation, verification, or webhook handling logic
- Customer checkout redirects to generic "ONLINE" without actual payment flow

## Scope

### In Scope
1. **Database Schema**: New tables for payment gateways, payments, payment refunds, webhook logs
2. **Backend Services**: Gateway abstraction, service implementations, payment orchestration
3. **Admin Features**: Gateway configuration UI, payment management, refund initiation
4. **Customer Features**: Dynamic gateway display, payment initiation, status polling
5. **Webhooks**: Signature verification, idempotent processing, order synchronization
6. **Refunds**: Admin-initiated refunds via gateway APIs

### Out of Scope
- Subscription/recurring payments
- International payment methods
- Cryptocurrency payments
- Split payments across multiple methods
- Payment plan/installments (can be added later)

## Architecture Approach

```
┌─────────────────┐
│  Customer App   │
│  (React)        │
└────────┬────────┘
         │ 1. Request payment
         ▼
┌─────────────────┐
│  Backend API    │
│  PaymentService │
└────────┬────────┘
         │ 2. Route to gateway
         ▼
┌─────────────────┐
│  Gateway        │
│  Services       │
│  (PhonePe/      │
│   Razorpay/     │
│   Paytm)        │
└────────┬────────┘
         │ 3. Webhook
         ▼
┌─────────────────┐
│  Webhook        │
│  Handler        │
└────────┬────────┘
         │ 4. Update records
         ▼
┌─────────────────┐
│  Database       │
│  (MongoDB)      │
└─────────────────┘
```

## Key Features

### 1. Gateway Abstraction Pattern
- Common `PaymentGatewayInterface` for all gateways
- Normalized request/response formats
- Consistent error handling
- Easy to add new gateways

### 2. Admin Control
- Enable/disable gateways without deployment
- Configure credentials (sandbox/production)
- Set default payment gateway
- View payment analytics and logs
- Initiate refunds

### 3. Security First
- Encrypted credential storage
- Webhook signature validation
- Idempotency keys for payment operations
- Rate limiting on payment endpoints
- Audit trails for all payment actions

### 4. Reliable Synchronization
- Webhooks as source of truth
- Fallback status polling
- Duplicate webhook prevention
- Failed webhook retry mechanism
- Comprehensive logging

## Technology Stack

### Backend
- **Language**: TypeScript
- **Framework**: Express.js (existing)
- **Database**: MongoDB with Mongoose
- **Encryption**: crypto module for credentials
- **HTTP Client**: axios for gateway API calls
- **Validation**: Zod (existing pattern)

### Frontend (Admin & Customer)
- **Framework**: React 19 with TypeScript
- **State Management**: Redux Toolkit (existing)
- **Styling**: Tailwind CSS (existing)
- **HTTP**: Axios (existing service layer)

### External Dependencies
- **PhonePe SDK**: `phonepe-kit` (npm)
- **Razorpay SDK**: `razorpay` (npm) - Official SDK
- **Paytm SDK**: Custom implementation using their APIs

## Integration Points

### Modified Modules
- **Order Module**: Add payment ID reference, enhanced status sync
- **Checkout Module**: Dynamic gateway selection and initiation
- **Refund Ledger**: Connect to new payment records

### New Modules
- **Payment Module**: Core payment orchestration
- **Gateway Services**: PhonePe, Razorpay, Paytm implementations
- **Webhook Module**: Gateway webhook handling

## Success Criteria

✅ Admin can configure gateways without code deployment  
✅ Customer sees enabled gateways on checkout  
✅ Payments are successfully initiated and redirected to gateway  
✅ Webhooks update payment and order status automatically  
✅ Admin can view all payments with filters  
✅ Admin can initiate full/partial refunds  
✅ Refund status syncs back to system  
✅ All existing COD flows work without changes  
✅ Comprehensive audit logs for debugging  
✅ Zero downtime deployment possible  

## Risk Mitigation

### Backward Compatibility
- Feature flag for rollback capability
- Existing order creation flow preserved
- COD payments unaffected
- Gradual rollout strategy

### Security
- Credentials encrypted at rest
- Never expose secrets in logs
- Webhook signature validation mandatory
- Rate limiting on sensitive endpoints

### Reliability
- Idempotency keys prevent duplicate payments
- Transaction locks prevent race conditions
- Failed webhooks logged for manual review
- Polling as fallback for webhook failures

## Dependencies

### External Services
- PhonePe Merchant Account (sandbox + production)
- Razorpay Merchant Account (sandbox + production)
- Paytm Merchant Account (sandbox + production)

### Internal Prerequisites
- MongoDB indexes for performance
- Redis for caching gateway config (optional)
- Environment variables for secrets
- Admin user permissions for payment management

## Timeline Estimate

- **Phase 0 (Analysis)**: ✅ Complete
- **Phase 1 (Database)**: 1 day
- **Phase 2 (Backend)**: 4-5 days
- **Phase 3 (Admin App)**: 2-3 days
- **Phase 4 (Customer App)**: 2-3 days
- **Phase 5 (Testing)**: 2-3 days
- **Phase 6 (Documentation)**: 1 day

**Total**: ~12-15 days

## Related Documentation

- [Implementation Plan](./implementation-plan.md) - Detailed development plan
- [API Flows](./api-flows.md) - Complete API documentation
- [Database Schema](./database-schema.md) - Schema design and migrations
- [UI Flows](./ui-flows.md) - User interface flows
- [Testing Plan](./testing-plan.md) - Testing strategy and test cases
- [Security Guidelines](./security-guidelines.md) - Security best practices

## Team Contacts

- **Module Owner**: Backend Team
- **Stakeholders**: Product, Finance, Customer Support
- **Reviewers**: Security Team, Compliance Team

---

**Status**: ✅ Analysis Complete | 🟡 Implementation Pending  
**Last Updated**: 2026-01-07  
**Version**: 1.0.0
