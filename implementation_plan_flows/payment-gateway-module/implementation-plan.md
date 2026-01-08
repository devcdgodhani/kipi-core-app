# Dynamic Payment Gateway System - Implementation Plan

## Goal Description

Transform the Kipi Core App's basic payment handling into a robust, multi-gateway payment system supporting PhonePe, Razorpay, and Paytm. The system will provide admin-controlled configuration, secure payment processing, webhook synchronization, and comprehensive refund management while maintaining complete backward compatibility with existing COD and order flows.

### Current State
- Order model tracks payment status but no actual gateway integration
- Checkout flow offers ONLINE option but doesn't process payments
- Refund ledger exists with gateway fields but no implementation
- Webhook infrastructure present but not utilized for payments

### Target State
- Multiple payment gateways configurable via admin panel
- Seamless payment initiation and webhook-based confirmation
- Comprehensive payment tracking with full audit trails
- Admin-controlled refund management through gateway APIs
- Zero disruption to existing COD and order flows

---

## User Review Required

> [!IMPORTANT]
> **New Database Tables**: This implementation adds 3 new database tables (`payment_gateways`, `payments`, `payment_refunds`). The existing `webhookLogModel` will be extended to support payment webhooks.

> [!IMPORTANT]
> **Order Model Changes**: The `orderModel` will be extended with a `paymentId` field to reference payment records. This is backward compatible (optional field).

> [!WARNING]
> **Breaking Change for "ONLINE" Payments**: Current orders with `paymentMethod: 'ONLINE'` have no real payment processing. After this implementation, "ONLINE" payments will require selecting a specific gateway and completing the payment flow. Existing "ONLINE" orders will be migrated/marked appropriately.

> [!CAUTION]
> **Environment Variables Required**: Gateway credentials (PhonePe merchant ID, Razorpay API keys, Paytm merchant keys) must be configured in `.env` before deployment. The admin UI will manage runtime toggling, but base credentials must exist.

> [!IMPORTANT]
> **Webhook Endpoints**: New public endpoints (`/api/v1/webhook/phonepe`, `/api/v1/webhook/razorpay`, `/api/v1/webhook/paytm`) will be exposed. These must support POST requests from external gateways and be accessible from the internet (no authentication, signature-verified).

> [!NOTE]
> **Testing Strategy**: All gateway integrations will first be tested in sandbox mode. Switching to production requires admin action and credential updates.

---

## Proposed Changes

### Backend - Database Layer

#### [NEW] [paymentGatewayModel.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/db/mongodb/models/paymentGatewayModel.ts)

New model to store payment gateway configurations:
- Fields: `name`, `displayName`, `isEnabled`, `environment`, `credentials` (encrypted), `webhookSecret`, `config`, `priority`
- Admin-controlled enable/disable
- Encrypted credential storage using crypto
- Supports sandbox and production environments

#### [NEW] [paymentModel.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/db/mongodb/models/paymentModel.ts)

Core payment transaction model:
- Links to `orderId` (required) and `userId`
- Tracks gateway name, transaction IDs (internal and gateway)
- Status: INITIATED, PENDING, SUCCESS, FAILED, REFUNDED, PARTIAL_REFUND
- Amount, currency, metadata
- Webhook processing timestamps
- Idempotency key for duplicate prevention

#### [NEW] [paymentRefundModel.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/db/mongodb/models/paymentRefundModel.ts)

Dedicated refund tracking:
- Links to `paymentId`, `orderId`, `userId`
- Gateway refund ID tracking
- Refund amount  (supports partial refunds)
- Status: INITIATED, PENDING, SUCCESS, FAILED
- Admin user tracking (`initiatedBy`, `processedBy`)
- Reason and notes fields

#### [MODIFY] [orderModel.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/db/mongodb/models/orderModel.ts)

Add optional payment reference:
```typescript
paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' }
```

Index for faster lookups:
```typescript
OrderSchema.index({ paymentId: 1 });
```

#### [MODIFY] [webhookLogModel.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/db/mongodb/models/webhookLogModel.ts)

Add payment-specific fields:
```typescript
paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' }
signatureValid: { type: Boolean }
```

---

### Backend - Type Definitions

#### [NEW] [payment.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/types/payment.ts)

TypeScript interfaces for:
- Payment entity (`IPayment`)
- Payment gateway entity (`IPaymentGateway`)
- Payment refund entity (`IPaymentRefund`)
- Request/response types for payment operations
- Gateway-specific metadata types

---

### Backend - Payment Gateway Services

#### [NEW] [PaymentGatewayInterface.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/services/contracts/PaymentGatewayInterface.ts)

Common interface for all gateways:
```typescript
interface IPaymentGatewayService {
  createPayment(order: IOrder, amount: number, metadata?: any): Promise<PaymentInitResponse>;
  verifyPayment(data: any): Promise<PaymentVerifyResponse>;
  refundPayment(payment: IPayment, amount: number, reason?: string): Promise<RefundResponse>;
  fetchPaymentStatus(transactionId: string): Promise<PaymentStatusResponse>;
  verifyWebhookSignature(payload: any, signature: string): boolean;
}
```

#### [NEW] [PhonePeGatewayService.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/services/concrete/PhonePeGatewayService.ts)

PhonePe implementation:
- Uses PhonePe Pay API v3
- Handles UPI, cards, wallets, netbanking
- Webhook signature verification using SHA-256
- Supports both app and web redirect flows
- Error code mapping to standardized responses

#### [NEW] [RazorpayGatewayService.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/services/concrete/RazorpayGatewayService.ts)

Razorpay implementation:
- Uses official `razorpay` npm SDK
- Order creation and payment verification
- Webhook signature verification using HMAC
- Comprehensive payment status mapping
- Supports instant refunds

#### [NEW] [PaytmGatewayService.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/services/concrete/PaytmGatewayService.ts)

Paytm implementation:
- Direct API implementation (no official TypeScript SDK)
- Checksum generation and verification
- Transaction status API integration
- Refund API with status tracking

---

### Backend - Core Services

#### [NEW] [paymentService.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/services/concrete/paymentService.ts)

Central payment orchestrator:
- Extends `MongooseCommonService<IPayment>`
- `initiatePayment(order, gatewayName)`: Routes to appropriate gateway
- `verifyPayment(paymentId, gatewayData)`: Validates payment completion
- `syncPaymentStatus(paymentId)`: Polls gateway for status
- `updatePaymentFromWebhook(webhookData)`: Processes webhook events
- Uses transactions for atomic order + payment updates
- Implements idempotency using `idempotencyKey`

#### [NEW] [paymentGatewayService.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/services/concrete/paymentGatewayService.ts)

Gateway configuration management:
- Extends `MongooseCommonService<IPaymentGateway>`
- `getActiveGateways()`: Returns enabled gateways for frontend
- `getGatewayByName(name)`: Fetches configuration with decrypted credentials
- `updateGatewayCredentials(name, credentials)`: Encrypts and stores
- Caching layer (Redis) for frequently accessed configs

#### [NEW] [paymentRefundService.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/services/concrete/paymentRefundService.ts)

Refund management:
- Extends `MongooseCommonService<IPaymentRefund>`
- `initiateRefund(paymentId, amount, reason, adminId)`: Creates refund request
- `processRefund(refundId)`: Calls gateway API and updates status
- `syncRefundStatus(refundId)`: Polls gateway for refund status
- Links refunds to payments, orders, and return/RTO records

#### [NEW] [webhookHandlerService.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/services/concrete/webhookHandlerService.ts)

Webhook processing:
- `handlePhonePeWebhook(payload, signature)`: PhonePe-specific handling
- `handleRazorpayWebhook(payload, signature)`: Razorpay-specific handling
- `handlePaytmWebhook(payload, signature)`: Paytm-specific handling
- Signature validation before processing
- Duplicate detection using `eventId`
- Async processing with retry on failure
- Comprehensive logging to `webhookLogModel`

#### [MODIFY] [orderService.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/services/concrete/orderService.ts)

Update order creation flow:
- For `paymentMethod: 'ONLINE'`, create payment record after order
- Link `order.paymentId` to created payment
- Do NOT mark order as CONFIRMED until payment SUCCESS
- New method: `updateOrderPaymentStatus(orderId, paymentStatus)` called by webhooks

---

### Backend - Controllers

#### [NEW] [paymentController.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/controllers/paymentController.ts)

Payment operations:
- `initiatePayment(req, res)`: Creates payment and returns gateway URL/data
- `verifyPayment(req, res)`: Verifies payment after gateway redirect
- `getPaymentById(req, res)`: Fetches payment details
- `getMyPayments(req, res)`: User's payment history
- `getAllPayments(req, res)`: Admin - all payments with filters

#### [NEW] [paymentGatewayController.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/controllers/paymentGatewayController.ts)

Gateway management (Admin only):
- `getAllGateways(req, res)`: List all gateways with status
- `getActiveGateways(req, res)`: Public - enabled gateways only
- `updateGatewayConfig(req, res)`: Update gateway settings
- `toggleGateway(req, res)`: Enable/disable gateway

#### [NEW] [paymentRefundController.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/controllers/paymentRefundController.ts)

Refund operations (Admin only):
- `initiateRefund(req, res)`: Create refund request
- `getRefundsByOrder(req, res)`: Refunds for an order
- `getAllRefunds(req, res)`: All refunds with filters
- `syncRefundStatus(req, res)`: Manual sync from gateway

#### [NEW] [webhookController.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/controllers/webhookController.ts)

Public webhook endpoints (no JWT auth):
- `handlePhonePeWebhook(req, res)`: POST `/api/v1/webhook/phonepe`
- `handleRazorpayWebhook(req, res)`: POST `/api/v1/webhook/razorpay`
- `handlePaytmWebhook(req, res)`: POST `/api/v1/webhook/paytm`
- Return 200 immediately, process async
- IP whitelist validation (optional)

---

### Backend - Routes

#### [NEW] [paymentRoutes.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/routes/customer/paymentRoutes.ts)

Customer payment routes:
```typescript
POST   /api/v1/customer/payment/initiate
POST   /api/v1/customer/payment/verify
GET    /api/v1/customer/payment/:id
POST   /api/v1/customer/payment/myPayments
```

#### [NEW] [paymentRoutes.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/routes/admin/paymentRoutes.ts)

Admin payment routes:
```typescript
POST   /api/v1/admin/payment/getAll
GET    /api/v1/admin/payment/:id
```

#### [NEW] [paymentGatewayRoutes.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/routes/admin/paymentGatewayRoutes.ts)

Gateway management:
```typescript
GET    /api/v1/admin/payment-gateway/getAll
GET    /api/v1/admin/payment-gateway/active
PUT    /api/v1/admin/payment-gateway/:id/update
PUT    /api/v1/admin/payment-gateway/:id/toggle
```

#### [NEW] [paymentRefundRoutes.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/routes/admin/paymentRefundRoutes.ts)

Refund management:
```typescript
POST   /api/v1/admin/refund/initiate
GET    /api/v1/admin/refund/order/:orderId
POST   /api/v1/admin/refund/getAll
POST   /api/v1/admin/refund/:id/sync
```

#### [NEW] [webhookRoutes.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/routes/common/webhookRoutes.ts)

Public webhook routes (no auth middleware):
```typescript
POST   /api/v1/webhook/phonepe
POST   /api/v1/webhook/razorpay
POST   /api/v1/webhook/paytm
```

---

### Backend - Validators

#### [NEW] [paymentValidators.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/validators/paymentValidators.ts)

Zod schemas for:
- `initiatePaymentSchema`: Validates order ID, gateway name
- `verifyPaymentSchema`: Validates payment ID and gateway response
- `refundSchema`: Validates payment ID, amount, reason

---

### Backend - Helpers

#### [NEW] [encryptionHelper.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/helpers/encryptionHelper.ts)

Credential encryption:
- `encrypt(text)`: AES-256-CBC encryption for gateway credentials
- `decrypt(encrypted)`: Decryption for secure credential retrieval
- Uses `ENCRYPTION_KEY` from environment

---

### Admin App - Services

#### [NEW] [paymentGateway.service.ts](file:///home/aurum/dev-chetan/kipi-core-app/admin/src/services/paymentGateway.service.ts)

API calls for gateway management:
- `getAllGateways()`
- `updateGatewayConfig(id, config)`
- `toggleGateway(id, isEnabled)`

#### [NEW] [payment.service.ts](file:///home/aurum/dev-chetan/kipi-core-app/admin/src/services/payment.service.ts)

Payment queries:
- `getAllPayments(filters)`
- `getPaymentById(id)`
- `getPaymentsByOrder(orderId)`

#### [NEW] [paymentRefund.service.ts](file:///home/aurum/dev-chetan/kipi-core-app/admin/src/services/paymentRefund.service.ts)

Refund operations:
- `initiateRefund(paymentId, amount, reason)`
- `getRefundsByOrder(orderId)`
- `getAllRefunds(filters)`
- `syncRefundStatus(refundId)`

---

### Admin App - Pages

#### [NEW] [PaymentGatewayConfig.tsx](file:///home/aurum/dev-chetan/kipi-core-app/admin/src/pages/PaymentGateway/PaymentGatewayConfig.tsx)

Gateway configuration interface:
- List all gateways with enable/disable toggle
- Edit gateway credentials (masked input)
- Switch between sandbox and production
- Test gateway connection button
- Set default/priority order

#### [NEW] [PaymentManagement.tsx](file:///home/aurum/dev-chetan/kipi-core-app/admin/src/pages/Payment/PaymentManagement.tsx)

Payment dashboard:
- DataTable with filters (date range, status, gateway, order ID)
- Columns: Order Number, Payment ID, Gateway, Amount, Status, Date
- Click row to view full payment details
- Link to associated order
- Webhook logs viewer

#### [NEW] [PaymentDetails.tsx](file:///home/aurum/dev-chetan/kipi-core-app/admin/src/pages/Payment/PaymentDetails.tsx)

Detailed payment view:
- Full payment information (gateway response, timestamps)
- Associated order details
- Webhook history for this payment
- Refund history
- Manual refund initiation button

#### [MODIFY] [RefundManagement.tsx](file:///home/aurum/dev-chetan/kipi-core-app/admin/src/pages/Return/RefundManagement.tsx)

Enhance existing refund UI:
- Add gateway refund initiation
- Show gateway refund status
- Sync button for manual status updates
- Display gateway refund ID and response

---

### Admin App - Components

#### [NEW] [GatewayCard.tsx](file:///home/aurum/dev-chetan/kipi-core-app/admin/src/components/payment/GatewayCard.tsx)

Display card for each gateway:
- Gateway logo and name
- Status indicator (enabled/disabled)
- Environment badge (sandbox/production)
- Quick actions (edit, toggle)

#### [NEW] [PaymentDetailsModal.tsx](file:///home/aurum/dev-chetan/kipi-core-app/admin/src/components/payment/PaymentDetailsModal.tsx)

Modal for payment details:
- Timeline of payment events
- Gateway-specific metadata
- Copy transaction IDs

#### [NEW] [RefundModal.tsx](file:///home/aurum/dev-chetan/kipi-core-app/admin/src/components/payment/RefundModal.tsx)

Refund initiation form:
- Amount input (with max validation based on payment amount)
- Reason dropdown + text area
- Partial vs Full refund selection
- Confirmation step

---

### Customer App - Services

#### [NEW] [payment.service.ts](file:///home/aurum/dev-chetan/kipi-core-app/customer/src/services/payment.service.ts)

Payment operations:
- `getActiveGateways()`: Fetch enabled gateways for checkout
- `initiatePayment(orderId, gatewayName)`: Start payment flow
- `verifyPayment(paymentId, gatewayData)`: Verify after redirect
- `getPaymentById(id)`: Fetch payment details
- `getMyPayments()`: User's payment history

---

### Customer App - Context & State

#### [MODIFY] [CheckoutContext.tsx](file:///home/aurum/dev-chetan/kipi-core-app/customer/src/context/CheckoutContext.tsx)

Add payment gateway state:
```typescript
const [availableGateways, setAvailableGateways] = useState([]);
const [selectedGateway, setSelectedGateway] = useState(null);
```

Update `placeOrder()` to:
1. Create order
2. If paymentMethod is 'ONLINE', initiate payment
3. Redirect to gateway URL or open SDK

#### [NEW] [PaymentContext.tsx](file:///home/aurum/dev-chetan/kipi-core-app/customer/src/context/PaymentContext.tsx)

Payment-specific state:
- Payment status polling
- Redirect handling
- Error states

---

### Customer App - Pages

#### [MODIFY] [CheckoutPage.tsx](file:///home/aurum/dev-chetan/kipi-core-app/customer/src/pages/Checkout/CheckoutPage.tsx)

Update payment section to:
- Fetch and display available gateways dynamically
- Show gateway logos and names
- For ONLINE selection, show gateway selection modal/dropdown
- Replace generic "ONLINE" with specific gateway badges

#### [NEW] [PaymentRedirect.tsx](file:///home/aurum/dev-chetan/kipi-core-app/customer/src/pages/Payment/PaymentRedirect.tsx)

Handle gateway redirects:
- Parse query params from gateway callback
- Call verify API
- Show loading state while verifying
- Redirect to order confirmation or failure page

#### [NEW] [PaymentStatus.tsx](file:///home/aurum/dev-chetan/kipi-core-app/customer/src/pages/Payment/PaymentStatus.tsx)

Payment status page:
- Poll payment status every 2-3 seconds (max 30 seconds)
- Display payment processing animation
- Redirect to order confirmation on success
- Show failure message with retry option

#### [MODIFY] [OrderDetails.tsx](file:///home/aurum/dev-chetan/kipi-core-app/customer/src/pages/Order/OrderDetails.tsx)

Add payment information section:
- Payment method (COD or gateway name)
- Payment status badge
- Transaction ID (if available)
- Payment timeline

---

### Customer App - Components

#### [NEW] [GatewaySelector.tsx](file:///home/aurum/dev-chetan/kipi-core-app/customer/src/components/Payment/GatewaySelector.tsx)

Gateway selection UI:
- Radio buttons or cards for each gateway
- Gateway logos and trusted badges
- "Pay Securely" messaging

#### [NEW] [PaymentStatusIndicator.tsx](file:///home/aurum/dev-chetan/kipi-core-app/customer/src/components/Payment/PaymentStatusIndicator.tsx)

Visual payment status:
- Color-coded badges (pending, success, failed)
- Icons for each status
- Animated pending state

---

## Verification Plan

### Automated Tests

#### Backend Unit Tests

**File**: [paymentService.test.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/tests/paymentService.test.ts) (NEW)

Tests for:
- `paymentService.initiatePayment()` - Mocks gateway service, verifies payment creation
- `paymentService.verifyPayment()` - Tests success and failure scenarios
- `paymentService.updatePaymentFromWebhook()` - Idempotency and duplicate handling

**Run command**:
```bash
cd backend
npm test -- paymentService.test
```

**File**: [webhookHandlerService.test.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/tests/webhookHandlerService.test.ts) (NEW)

Tests for:
- Signature verification for each gateway
- Duplicate webhook detection
- Payment status update logic

**Run command**:
```bash
cd backend
npm test -- webhookHandlerService.test
```

#### Gateway Integration Tests (Sandbox)

**File**: [gatewayIntegration.test.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/tests/gatewayIntegration.test.ts) (NEW)

End-to-end tests against sandbox APIs:
- PhonePe payment initiation and verification (sandbox)
- Razorpay payment flow (test mode)
- Paytm integration (staging)

**Run command**:
```bash
cd backend
ENVIRONMENT=test npm test -- gatewayIntegration.test
```

**Prerequisites**:
- Sandbox credentials configured in `.env.test`
- Internet connectivity

#### Database Migration Test

**File**: [paymentMigration.test.ts](file:///home/aurum/dev-chetan/kipi-core-app/backend/src/tests/paymentMigration.test.ts) (NEW)

Verify:
- All new models create correctly
- Indexes are applied
- Encryption/decryption works for credentials

**Run command**:
```bash
cd backend
npm test -- paymentMigration.test
```

---

### Manual Verification

#### 1. Admin Gateway Configuration

**Steps**:
1. Login to admin app (`http://localhost:5173`)
2. Navigate to "Payment Gateways" (new menu item)
3. Verify all three gateways (PhonePe, Razorpay, Paytm) are listed
4. For PhonePe:
   - Toggle "Enable" ON
   - Select "Sandbox" environment
   - Enter sandbox credentials (merchant ID, salt key)
   - Click "Save"
   - Verify success toast
5. Repeat for Razorpay and Paytm
6. Set PhonePe as default (if priority selection implemented)

**Expected Result**:
- All configurations save successfully
- Credentials are masked in UI after save
- Status toggles work without refresh

---

#### 2. Customer Checkout Flow - PhonePe

**Steps**:
1. Login to customer app (`http://localhost:5174`)
2. Add products to cart (at least ₹10 worth)
3. Navigate to checkout
4. Select address
5. Select "Online Payment" payment method
6. Verify PhonePe appears as an option with logo
7. Select PhonePe
8. Click "Place Order"
9. Verify redirect to PhonePe payment page (sandbox)
10. Complete test payment using PhonePe test credentials
11. Verify redirect back to customer app
12. Verify order confirmation page shows payment success

**Expected Result**:
- Payment gateway selection appears
- Redirect to PhonePe works
- Webhook updates order status to CONFIRMED
- Payment record created with status SUCCESS

**How to verify in code**:
- Check `payments` collection in MongoDB for new record
- Check `orders` collection - `paymentStatus` should be `COMPLETED`
- Check `orderStatus` should be `CONFIRMED`

---

#### 3. Customer Checkout Flow - Razorpay

**Steps** (same as PhonePe but select Razorpay):
1-12. Repeat above steps but select Razorpay gateway
13. Use Razorpay test card: `4111 1111 1111 1111`, CVV: `123`
14. Verify payment success and order confirmation

**Expected Result**: Same as PhonePe

---

#### 4. Payment Failure Handling

**Steps**:
1. Follow checkout steps above
2. On gateway page, click "Cancel" or use a test failure card
3. Verify redirect back to customer app shows failure message
4. Verify payment status is FAILED
5. Verify order status remains PENDING (not CONFIRMED)

**Expected Result**:
- Payment marked as FAILED
- Order not confirmed
- User can retry payment

---

#### 5. Webhook Processing

**Steps**:
1. Use a tool like Postman or `curl` to simulate a webhook
2. Send POST to `http://localhost:8000/api/v1/webhook/phonepe`
3. Use a sample PhonePe webhook payload (with valid signature)
4. Check `webhookLogModel` for new entry
5. Verify payment status updated
6. Verify order status updated

**Expected Result**:
- Webhook logged with `processed: true`
- Payment and order statuses synchronized
- Duplicate webhooks (same eventId) are ignored

**Sample PhonePe webhook**:
```json
{
  "merchantId": "MERCHANT_ID",
  "transactionId": "TXN123",
  "amount": 1000,
  "code": "PAYMENT_SUCCESS",
  "providerReferenceId": "PROVIDER_REF"
}
```
(**Note**: Actual payload structure depends on PhonePe documentation; include valid signature header)

---

#### 6. Admin Payment Management

**Steps**:
1. Login to admin app
2. Navigate to "Payments" (new menu)
3. Verify payments list shows recent payments
4. Filter by:
   - Date range (last 7 days)
   - Status (SUCCESS)
   - Gateway (PhonePe)
5. Click on a payment to view details
6. Verify full payment information is displayed
7. Verify webhook logs section shows webhook events

**Expected Result**:
- Filters work correctly
- Payment details modal shows all information
- Transaction IDs are displayed and copyable

---

#### 7. Admin Refund Initiation

**Steps**:
1. In admin app, go to "Payments"
2. Select a successful payment
3. Click "Initiate Refund"
4. Enter refund amount (full or partial)
5. Enter reason: "Customer request"
6. Click "Confirm Refund"
7. Wait for gateway processing
8. Verify refund status updates to SUCCESS
9. Check payment status becomes REFUNDED or PARTIAL_REFUND

**Expected Result**:
- Refund initiated in gateway
- Refund record created in database
- Status syncs back via webhook or polling
- Linked order's payment status updated

**Database verification**:
- Check `payment_refunds` collection for new record
- Check `refund_ledger` collection (existing) gets update
- Verify `gatewayRefundId` is populated

---

#### 8. Backward Compatibility - COD Orders

**Steps**:
1. Create new order with payment method COD
2. Verify checkout flow unchanged
3. Verify order creates successfully
4. Verify NO payment record created
5. Verify order confirmation works as before

**Expected Result**:
- COD flow completely unchanged
- No errors or new UI elements for COD
- Admins can process COD orders as before

---

#### 9. Environment Switching

**Steps**:
1. In admin, go to PhonePe gateway config
2. Switch from "Sandbox" to "Production"
3. Update credentials with production keys
4. Save configuration
5. Attempt customer checkout with PhonePe
6. Verify production gateway is invoked (check URL in network tab)

**Expected Result**:
- Sandbox/production switch persists
- Correct API endpoints used based on environment
- Credentials securely stored

**WARNING**: Only perform step 6 if production credentials are intentionally configured. Otherwise, stop at step 4 and verify in database.

---

### Browser Automation Tests

I can create a browser test for the checkout flow, but I need your confirmation on:
- Do you have existing browser tests or Playwright/Cypress setup?
- Should I add browser tests or is manual testing sufficient for the verification phase?

---

## Manual Testing Assistance Needed

> [!NOTE]
> **Gateway Sandbox Accounts**: I need confirmation that you have access to sandbox accounts for:
> - PhonePe Business (merchant account)
> - Razorpay (test mode)
> - Paytm (staging environment)
>
> If not, I can help set these up or we can start with just Razorpay (easiest to get test access).

> [!NOTE]
> **Webhook Testing**: For local webhook testing, you'll need:
> - ngrok or similar tunneling tool to expose localhost
> - OR we can deploy to staging first
>
> Which approach do you prefer?

---

## Rollback Plan

If issues arise during deployment:

1. **Feature Flag**: Set `PAYMENT_GATEWAY_ENABLED=false` in environment
2. **Database Rollback**: No destructive changes, safe to keep new collections
3. **Code Rollback**: Git revert to pre-payment-gateway commit
4. **Order Processing**: COD orders continue to work normally

---

## Post-Deployment Checklist

- [ ] Verify all gateway webhooks are receiving events
- [ ] Monitor payment success rate (target: >95%)
- [ ] Check webhook processing time (target: <2 seconds)
- [ ] Review error logs for any gateway failures
- [ ] Confirm refunds process within expected time (varies by gateway)
- [ ] Update documentation with production webhook URLs
- [ ] Train support team on payment issue debugging
- [ ] Set up alerts for failed webhooks or payment anomalies

---

**Ready for Review**: This implementation plan is complete pending your feedback on:
1. Sandbox account availability
2. Webhook testing approach preference  
3. Browser test coverage requirements

Once approved, I'll proceed to Phase 1 (Database Design & Migrations).
