# Logistics Module - Implementation Plan

## User Review Required

> [!IMPORTANT]
> **Scale**: This module is designed for 1M+ orders/month
> 
> **Timeline**: 12 weeks full implementation
> 
> **Breaking Changes**:
> - Order model extended with new fields (shipment, RTO, NDR)
> - SKU model extended with reserved quantity
> - New event-driven architecture requires Redis
> - Webhook endpoints must be exposed publicly

> [!WARNING]
> **Infrastructure Requirements**:
> - Redis server for queues and cache
> - Bull/BullMQ for async processing
> - Shiprocket account with API credentials
> - WhatsApp Business API for notifications
> - Public webhook endpoint (ngrok for dev)

---

## Goals
1. **Reduce RTO** from 25-30% to <10% using intelligent scoring
2. **Automate logistics** - 100% automated shipment creation and tracking
3. **Accurate ETAs** - 80%+ accuracy with confidence ranges
4. **Real-time updates** - Webhook-driven order status updates
5. **Complete audit trail** - Every logistics event tracked and logged

## Requirements

### Functional Requirements
- [ ] Shiprocket API integration with authentication and rate limiting
- [ ] Order to shipment conversion with AWB generation
- [ ] Real-time tracking via webhooks
- [ ] RTO scoring and threshold enforcement
- [ ] ETA calculation with historical data analysis
- [ ] NDR (Non-Delivery Report) management
- [ ] Multi-warehouse support
- [ ] Courier performance tracking
- [ ] Automated refund processing
- [ ] COD settlement tracking
- [ ] Stock reservation and reversion
- [ ] Loyalty point reversal on RTO
- [ ] Coupon reversal on cancellation
- [ ] WhatsApp + Email notifications
- [ ] Admin dashboard for logistics management
- [ ] Customer order tracking portal

### Non-Functional Requirements
- [ ] API response time <500ms
- [ ] Webhook processing <5s
- [ ] Support 1M+ orders/month
- [ ] 99.9% uptime
- [ ] Idempotent operations
- [ ] Transaction safety for multi-step operations
- [ ] Circuit breaker for courier API failures
- [ ] Comprehensive error handling and logging

---

## Proposed Changes

### Backend Changes

#### Database Models (17 New + 4 Extended)

##### [NEW] `shipmentModel.ts`
Complete shipment lifecycle tracking with courier integration
```typescript
{
  orderId: ObjectId,
  awb: String (unique),
  courierName: String,
  courierId: ObjectId,
  warehouseId: ObjectId,
  status: Enum,
  trackingUrl: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  dimensions: { length, width, height, weight },
  charges: { shipping, cod, insurance },
  // ... 30+ fields total
}
```

##### [NEW] `trackingEventModel.ts`
All courier status updates
```typescript
{
  shipmentId: ObjectId,
  status: String,
  location: String,
  timestamp: Date,
  courierStatus: String,
  normalizedStatus: String,
  metadata: Object
}
```

##### [NEW] `courierModel.ts`
Courier provider configurations
```typescript
{
  name: String,
  apiConfig: Object,
  serviceability: Object,
  performance: {
    rtoRate, onTimeDelivery, avgDeliveryDays
  },
  isActive: Boolean
}
```

##### [NEW] `warehouseModel.ts`
Fulfillment center management
```typescript
{
  name: String,
  address: Object,
  pincode: String,
  isActive: Boolean,
  inventory: [{ skuId, quantity }]
}
```

##### [NEW] `ndrModel.ts`
Non-delivery report handling
```typescript
{
  shipmentId: ObjectId,
  orderId: ObjectId,
  reason: String,
  customerAction: String,
  resolvedAt: Date,
  status: Enum
}
```

##### [NEW] `rtoModel.ts`
Return-to-origin with QC workflow
```typescript
{
  shipmentId: ObjectId,
  orderId: ObjectId,
  reason: String,
  qcStatus: Enum,
  qcNotes: String,
  restockedAt: Date,
  refundProcessed: Boolean
}
```

##### [NEW] `refundLedgerModel.ts`
Refund audit trail
```typescript
{
  orderId: ObjectId,
  amount: Number,
  reason: String,
  status: Enum,
  processedAt: Date,
  transactionId: String
}
```

##### [NEW] `codLedgerModel.ts`
COD settlement tracking
```typescript
{
  shipmentId: ObjectId,
  orderId: ObjectId,
  amount: Number,
  collectedAt: Date,
  remittedAt: Date,
  status: Enum
}
```

##### [NEW] `webhookLogModel.ts`
Webhook debugging and audit
```typescript
{
  provider: String,
  event: String,
  payload: Object,
  signature: String,
  verified: Boolean,
  processed: Boolean,
  error: String
}
```

##### [NEW] `idempotencyCacheModel.ts`
API response caching for idempotency
```typescript
{
  key: String (unique),
  response: Object,
  expiresAt: Date
}
```

##### [NEW] `exchangeModel.ts`
Product exchange handling
```typescript
{
  orderId: ObjectId,
  returnId: ObjectId,
  newOrderId: ObjectId,
  status: Enum,
  exchangeItems: Array
}
```

##### [NEW] `rtoScoreModel.ts`
RTO risk scoring history
```typescript
{
  orderId: ObjectId,
  userId: ObjectId,
  score: Number,
  factors: {
    customerScore, pincodeScore, courierScore, orderScore
  },
  threshold: String,
  calculatedAt: Date
}
```

##### [NEW] `etaProfileModel.ts`
ETA calculation data
```typescript
{
  courierName: String,
  fromPincode: String,
  toPincode: String,
  avgDays: Number,
  confidence: Number,
  sampleSize: Number
}
```

##### [MODIFY] `orderModel.ts`
Extended with logistics fields
- Add `shipmentId: ObjectId`
- Add `rtoId: ObjectId`
- Add `ndrId: ObjectId`
- Add `trackingStatus: String`
- Add `estimatedDelivery: Date`

##### [MODIFY] `skuModel.ts`
Extended with stock reservation
- Add `reservedQuantity: Number`
- Update `availableQuantity` calculation

##### [MODIFY] `returnModel.ts`
Extended with pickup tracking
- Add `pickupId: ObjectId`
- Add `qcStatus: Enum`
- Add `qcNotes: String`

##### [MODIFY] `stockLedgerModel.ts`
Extended with RTO transaction types
- Add `RTO_RESTOCK` transaction type
- Add `SHIPMENT_RESERVE` transaction type

**Total Indexes**: 87+ across all models

---

#### Services (10 New + 3 Extended)

##### [NEW] `logisticsService.ts`
**Orchestrator for all logistics operations**

**Methods**:
- `createShipment(orderId)` - Order to shipment conversion
- `cancelShipment(shipmentId)` - Shipment cancellation
- `trackShipment(shipmentId)` - Get tracking details
- `processWebhook(payload)` - Webhook event handling
- `calculateETA(fromPincode, toPincode, courierId)` - ETA calculation
- `calculateRTOScore(orderId)` - RTO risk assessment

##### [NEW] `shiprocketProvider.ts`
**Implements ICourierProvider interface**

**Methods**:
- `authenticate()` - Token management (10-day expiry)
- `checkServiceability(pincode)` - Pincode serviceability
- `createOrder(orderData)` - Create Shiprocket order
- `createShipment(orderId)` - Generate AWB
- `trackShipment(awb)` - Get tracking info
- `cancelShipment(awb)` - Cancel shipment
- `generateLabel(shipmentId)` - Generate shipping label
- `schedulePickup(shipmentId)` - Schedule pickup

##### [NEW] `webhookProcessor.ts`
**Async webhook processing**

**Methods**:
- `verifySignature(payload, signature)` - Signature verification
- `checkIdempotency(webhookId)` - Duplicate prevention
- `normalizeEvent(provider, payload)` - Event normalization
- `processEvent(event)` - Event handling
- `handleDelivery(shipmentId)` - Delivery event
- `handleRTO(shipmentId)` - RTO event
- `handleNDR(shipmentId)` - NDR event

##### [NEW] `rtoScoringService.ts`
**RTO risk calculation**

**Methods**:
- `calculateScore(orderId)` - Calculate RTO risk score
- `getCustomerScore(userId)` - Customer risk (40%)
- `getPincodeScore(pincode)` - Pincode risk (30%)
- `getCourierScore(courierId, pincode)` - Courier risk (20%)
- `getOrderScore(order)` - Order risk (10%)
- `enforceThreshold(score)` - Threshold actions

##### [NEW] `etaCalculationService.ts`
**ETA prediction**

**Methods**:
- `calculateETA(fromPincode, toPincode, courierId)` - Calculate ETA
- `getHistoricalAverage(route, courierId)` - Historical data
- `getCourierSLA(courierId)` - Courier SLA
- `getDistanceFactor(fromPincode, toPincode)` - Distance calculation
- `getSeasonalAdjustment(date)` - Seasonal factors
- `getConfidenceRange(eta, sampleSize)` - Confidence calculation

##### [NEW] `ndrService.ts`
**NDR management**

**Methods**:
- `createNDR(shipmentId, reason)` - Create NDR
- `resolveNDR(ndrId, action)` - Resolve NDR
- `scheduleReattempt(ndrId)` - Schedule re-delivery
- `initiateRTO(ndrId)` - Convert to RTO

##### [NEW] `rtoService.ts`
**RTO workflow**

**Methods**:
- `createRTO(shipmentId, reason)` - Create RTO
- `performQC(rtoId, status, notes)` - Quality check
- `restockInventory(rtoId)` - Restock items
- `reverseLoyalty(orderId)` - Reverse loyalty points
- `reverseCoupon(orderId)` - Reverse coupon usage
- `processRefund(rtoId)` - Initiate refund

##### [NEW] `refundService.ts`
**Refund processing**

**Methods**:
- `createRefund(orderId, amount, reason)` - Create refund
- `processRefund(refundId)` - Process refund
- `updateStatus(refundId, status)` - Update status

##### [NEW] `codLedgerService.ts`
**COD settlement**

**Methods**:
- `recordCollection(shipmentId, amount)` - Record COD collection
- `recordRemittance(shipmentId, amount)` - Record remittance
- `reconcile(startDate, endDate)` - Reconciliation

##### [NEW] `warehouseService.ts`
**Warehouse management**

**Methods**:
- `create(warehouseData)` - Create warehouse
- `updateInventory(warehouseId, skuId, quantity)` - Update stock
- `getNearest(pincode)` - Find nearest warehouse

##### [MODIFY] `orderService.ts`
- Add `reserveStock(orderId)` - Stock reservation
- Add `releaseStock(orderId)` - Stock release
- Modify `create()` to call RTO scoring

##### [MODIFY] `inventoryService.ts`
- Add `reserveQuantity(skuId, quantity)` - Reserve stock
- Add `releaseQuantity(skuId, quantity)` - Release stock
- Add `restockFromRTO(rtoId)` - RTO restock

##### [MODIFY] `loyaltyService.ts`
- Add `reversePoints(orderId)` - Reverse loyalty on RTO

---

#### Controllers (11 New)

##### [NEW] `shipmentController.ts`
**Endpoints**:
- `POST /shipment` - Create shipment
- `POST /shipment/getAll` - List shipments
- `POST /shipment/getOne` - Get shipment details
- `PUT /shipment/:id/cancel` - Cancel shipment
- `POST /shipment/:id/track` - Track shipment
- `POST /shipment/:id/label` - Generate label
- `PUT /shipment/:id/status` - Update status
- `POST /shipment/bulk-create` - Bulk shipment creation

##### [NEW] `rtoController.ts`
- `POST /rto/getAll` - List RTOs
- `POST /rto/:id/qc` - Perform QC
- `POST /rto/:id/restock` - Restock inventory
- `POST /rto/:id/refund` - Process refund

##### [NEW] `ndrController.ts`
- `POST /ndr/getAll` - List NDRs
- `POST /ndr/:id/resolve` - Resolve NDR
- `POST /ndr/:id/reattempt` - Schedule reattempt
- `POST /ndr/:id/rto` - Convert to RTO

##### [NEW] `warehouseController.ts`
- `POST /warehouse` - Create warehouse
- `POST /warehouse/getAll` - List warehouses
- `PUT /warehouse/:id` - Update warehouse
- `DELETE /warehouse/deleteByFilter` - Delete warehouse

##### [NEW] `courierController.ts`
- `POST /courier` - Create courier config
- `POST /courier/getAll` - List couriers
- `PUT /courier/:id` - Update courier
- `POST /courier/:id/performance` - Get performance metrics

##### [NEW] `pickupController.ts`
- `POST /pickup/schedule` - Schedule pickup
- `POST /pickup/getAll` - List pickups
- `PUT /pickup/:id` - Update pickup

##### [NEW] `refundController.ts`
- `POST /refund` - Create refund
- `POST /refund/getAll` - List refunds
- `POST /refund/:id/process` - Process refund

##### [NEW] `codLedgerController.ts`
- `POST /cod-ledger/getAll` - List COD transactions
- `POST /cod-ledger/reconcile` - Reconcile COD

##### [NEW] `rtoScoreController.ts`
- `POST /rto-score/calculate` - Calculate RTO score
- `POST /rto-score/history` - Get scoring history

##### [NEW] `etaController.ts`
- `POST /eta/calculate` - Calculate ETA

##### [NEW] `webhookController.ts`
- `POST /webhook/shiprocket` - Shiprocket webhook endpoint

---

#### Routes (11 New)

All routes follow the pattern:
```typescript
router.route('/endpoint')
  .post(jwtAuth(), validator.method, controller.method);
```

Customer routes: `/api/v1/customer/logistics/*`
Admin routes: `/api/v1/admin/logistics/*`
Webhook routes: `/api/v1/webhook/*` (no auth)

---

#### Validators (11 New)

All validators use Zod for schema validation:
- Request body validation
- Query parameter validation
- URL parameter validation
- File upload validation (for labels)

---

### Frontend Changes

#### Customer App

##### [NEW] Pages
- `OrderTracking.tsx` - Real-time order tracking
- `ReturnRequest.tsx` - Return/exchange request form
- `TrackingTimeline.tsx` - Visual tracking timeline

##### [NEW] Components
- `TrackingCard.tsx` - Shipment status card
- `TrackingTimeline.tsx` - Timeline visualization
- `ReturnForm.tsx` - Return request form
- `ExchangeForm.tsx` - Exchange request form

##### [NEW] Services
- `tracking.service.ts` - Tracking API calls
- `return.service.ts` - Return/exchange API calls

##### [NEW] Redux Slices
- `trackingSlice.ts` - Tracking state management

---

#### Admin App

##### [NEW] Pages
- `ShipmentManagement.tsx` - Shipment list and details
- `RTOManagement.tsx` - RTO list and QC workflow
- `NDRManagement.tsx` - NDR list and resolution
- `WarehouseManagement.tsx` - Warehouse CRUD
- `CourierManagement.tsx` - Courier configuration
- `PickupManagement.tsx` - Pickup scheduling

##### [NEW] Components
- `ShipmentCard.tsx` - Shipment display
- `RTOQCForm.tsx` - RTO quality check form
- `NDRResolutionForm.tsx` - NDR resolution form
- `WarehouseForm.tsx` - Warehouse form
- `CourierPerformanceChart.tsx` - Courier analytics
- `PickupScheduler.tsx` - Pickup scheduling

##### [NEW] Services
- `shipment.service.ts`
- `rto.service.ts`
- `ndr.service.ts`
- `warehouse.service.ts`
- `courier.service.ts`
- `pickup.service.ts`

##### [NEW] Redux Slices
- `shipmentSlice.ts`
- `rtoSlice.ts`
- `ndrSlice.ts`
- `warehouseSlice.ts`
- `courierSlice.ts`

---

## Implementation Steps

### Phase 1: Foundation (Week 1-2)
1. [ ] Create all 17 MongoDB models
2. [ ] Extend 4 existing models
3. [ ] Set up Redis server
4. [ ] Install Bull/BullMQ
5. [ ] Configure Shiprocket credentials
6. [ ] Create base interfaces and types
7. [ ] Set up event emitter architecture

### Phase 2: Shiprocket Integration (Week 3-4)
1. [ ] Implement Shiprocket API wrapper
2. [ ] Implement authentication module
3. [ ] Implement rate limiting
4. [ ] Create ShiprocketProvider
5. [ ] Implement LogisticsService orchestrator
6. [ ] Create webhook controller
7. [ ] Implement webhook processor
8. [ ] Set up async queue processing

### Phase 3: Advanced Engines (Week 5-6)
1. [ ] Implement RTO scoring service
2. [ ] Create customer metrics collection
3. [ ] Create pincode risk analysis
4. [ ] Implement ETA calculation service
5. [ ] Create historical data collection jobs
6. [ ] Implement confidence range calculation
7. [ ] Create fallback mechanisms

### Phase 4: Core Services (Week 7)
1. [ ] Implement NDR service
2. [ ] Implement RTO service
3. [ ] Implement refund service
4. [ ] Implement COD ledger service
5. [ ] Implement warehouse service
6. [ ] Extend order service
7. [ ] Extend inventory service
8. [ ] Extend loyalty service

### Phase 5: Backend APIs (Week 8)
1. [ ] Create all 11 controllers
2. [ ] Create all 11 validators
3. [ ] Create all 11 route files
4. [ ] Implement error handling
5. [ ] Add request logging
6. [ ] Add response formatting

### Phase 6: Event Handlers (Week 9)
1. [ ] Implement delivery event handler
2. [ ] Implement RTO event handler
3. [ ] Implement NDR event handler
4. [ ] Implement inventory update handler
5. [ ] Implement loyalty reversal handler
6. [ ] Implement coupon reversal handler
7. [ ] Implement notification dispatch handler

### Phase 7: Customer Frontend (Week 10)
1. [ ] Create tracking page
2. [ ] Create return request page
3. [ ] Implement tracking service
4. [ ] Implement return service
5. [ ] Create tracking components
6. [ ] Create return components
7. [ ] Implement Redux slices
8. [ ] Add form validation

### Phase 8: Admin Frontend (Week 11)
1. [ ] Create 6 management pages
2. [ ] Implement 6 API services
3. [ ] Create all admin components
4. [ ] Implement Redux slices
5. [ ] Add form validation
6. [ ] Create analytics charts

### Phase 9: Notifications (Week 11)
1. [ ] Create 8 notification templates
2. [ ] Implement notification service
3. [ ] Integrate with WhatsApp API
4. [ ] Integrate with email service
5. [ ] Add payload validation
6. [ ] Add rate limiting
7. [ ] Add delivery tracking

### Phase 10: Testing (Week 12)
1. [ ] Unit tests for all services
2. [ ] Integration tests for APIs
3. [ ] Webhook simulation tests
4. [ ] Frontend component tests
5. [ ] E2E flow tests
6. [ ] Load testing
7. [ ] Security testing

### Phase 11: Documentation (Week 12)
1. [ ] API documentation
2. [ ] Webhook documentation
3. [ ] Deployment guide
4. [ ] Troubleshooting guide
5. [ ] Admin user guide
6. [ ] Developer guide

### Phase 12: Deployment (Week 12)
1. [ ] Staging deployment
2. [ ] UAT testing
3. [ ] Performance optimization
4. [ ] Production deployment
5. [ ] Monitoring setup
6. [ ] Alerting configuration

---

## Verification Plan

### Automated Tests

#### Unit Tests
- [ ] All service methods
- [ ] RTO scoring formula
- [ ] ETA calculation formula
- [ ] Webhook signature verification
- [ ] Event normalization
- [ ] Idempotency handling

#### Integration Tests
- [ ] Order to shipment flow
- [ ] Webhook processing flow
- [ ] RTO workflow
- [ ] NDR workflow
- [ ] Refund processing
- [ ] Stock reservation/release

#### E2E Tests
- [ ] Complete order lifecycle
- [ ] Customer tracking flow
- [ ] Admin RTO management
- [ ] Admin NDR resolution
- [ ] Notification delivery

### Manual Verification

#### Backend
- [ ] Create shipment via API
- [ ] Simulate webhook events (ngrok)
- [ ] Test RTO scoring with different scenarios
- [ ] Test ETA calculation accuracy
- [ ] Verify stock reservation
- [ ] Verify loyalty reversal
- [ ] Verify refund processing

#### Frontend
- [ ] Customer order tracking
- [ ] Customer return request
- [ ] Admin shipment management
- [ ] Admin RTO QC workflow
- [ ] Admin NDR resolution
- [ ] Analytics charts display

#### Notifications
- [ ] WhatsApp delivery
- [ ] Email delivery
- [ ] Template rendering
- [ ] Rate limiting

---

## Rollout Plan

### Development (Week 1-11)
1. Feature branch development
2. Daily code reviews
3. Continuous integration

### Staging (Week 12)
1. Deploy to staging environment
2. QA testing
3. Performance testing
4. Security audit
5. UAT with sample orders

### Production (Week 12)
1. Phased rollout (10% → 50% → 100%)
2. Monitor error rates
3. Monitor performance metrics
4. Gather user feedback
5. Hotfix deployment if needed

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Shiprocket API downtime | High | Medium | Circuit breaker, fallback to manual |
| Webhook failures | High | Medium | Retry queue, dead letter queue |
| Stock inconsistency | High | Low | MongoDB transactions, audit trails |
| Queue overload | Medium | Medium | Rate limiting, horizontal scaling |
| High RTO rate | High | High | RTO scoring engine, threshold enforcement |
| Inaccurate ETAs | Medium | Medium | Historical data analysis, confidence ranges |
| Redis failure | High | Low | Redis cluster, persistence |
| Data migration issues | High | Low | Careful migration scripts, rollback plan |

---

## Timeline

| Phase | Duration | Start Date | End Date | Deliverables |
|-------|----------|------------|----------|--------------|
| Phase 1 | 2 weeks | Week 1 | Week 2 | Models, Redis, Bull setup |
| Phase 2 | 2 weeks | Week 3 | Week 4 | Shiprocket integration |
| Phase 3 | 2 weeks | Week 5 | Week 6 | RTO & ETA engines |
| Phase 4 | 1 week | Week 7 | Week 7 | Core services |
| Phase 5 | 1 week | Week 8 | Week 8 | Backend APIs |
| Phase 6 | 1 week | Week 9 | Week 9 | Event handlers |
| Phase 7 | 1 week | Week 10 | Week 10 | Customer frontend |
| Phase 8 | 1 week | Week 11 | Week 11 | Admin frontend |
| Phase 9 | 1 week | Week 11 | Week 11 | Notifications |
| Phase 10-12 | 1 week | Week 12 | Week 12 | Testing & deployment |

**Total**: 12 weeks

---

## Success Criteria

- [ ] All 40+ API endpoints working
- [ ] All webhook events processed correctly
- [ ] RTO rate reduced to <10%
- [ ] ETA accuracy >80%
- [ ] Webhook processing <5s
- [ ] API response time <500ms
- [ ] All tests passing (>85% coverage)
- [ ] Documentation complete
- [ ] Code reviewed and approved
- [ ] Deployed to production
- [ ] Monitoring and alerting active
