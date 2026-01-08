# Testing Plan - Payment Gateway Module

## Test Coverage Strategy

This module requires comprehensive testing across unit tests, integration tests, manual testing, and end-to-end testing.

---

## 1. Backend Unit Tests

### Location
`backend/src/tests/`

### Test Files to Create

#### 1.1 `paymentService.test.ts`

**Tests**:
- ✅ `initiatePayment()` creates payment record with correct status
- ✅ `initiatePayment()` generates unique idempotency key
- ✅ `initiatePayment()` routes to correct gateway service
- ✅ `verifyPayment()` updates payment and order status on success
- ✅ `verifyPayment()` handles gateway verification failure
- ✅ `updatePaymentFromWebhook()` prevents duplicate processing
- ✅ `updatePaymentFromWebhook()` updates order status correctly

**Command**:
```bash
cd backend
npm test -- paymentService.test.ts
```

---

#### 1.2 `webhookHandlerService.test.ts`

**Tests**:
- ✅ PhonePe webhook signature verification (valid/invalid)
- ✅ Razorpay webhook signature verification (valid/invalid)
- ✅ Paytm webhook checksum verification (valid/invalid)
- ✅ Duplicate webhook detection by eventId
- ✅ Webhook processing updates payment status
- ✅ Webhook processing updates order status
- ✅ Failed signature creates webhook log with `signatureValid: false`

**Command**:
```bash
cd backend
npm test -- webhookHandlerService.test.ts
```

---

#### 1.3 `gatewayServices.test.ts`

**Tests** (per gateway):
- ✅ `PhonePeGatewayService.createPayment()` returns correct format
- ✅ `PhonePeGatewayService.verifyWebhookSignature()` validates correctly
- ✅ `RazorpayGatewayService.createPayment()` uses SDK correctly
- ✅ `PaytmGatewayService.refundPayment()` calls API with checksum

**Command**:
```bash
cd backend
npm test -- gatewayServices.test.ts
```

---

#### 1.4 `encryptionHelper.test.ts`

**Tests**:
- ✅ `encrypt()` produces different output each time (IV randomness)
- ✅ `decrypt()` reverses encryption correctly
- ✅ Encrypted data cannot be read without key

**Command**:
```bash
cd backend
npm test -- encryptionHelper.test.ts
```

---

## 2. Backend Integration Tests (Sandbox)

### Prerequisites
- Sandbox credentials configured in `.env.test`
- Internet connection

### Test File
`backend/src/tests/integration/gatewayIntegration.test.ts`

**Tests**:
- ✅ PhonePe sandbox payment initiation (end-to-end)
- ✅ Razorpay test mode payment (end-to-end)
- ✅ Paytm staging payment (end-to-end)
- ✅ Refund initiation and status check

**Command**:
```bash
cd backend
NODE_ENV=test npm test -- gatewayIntegration.test.ts
```

**Note**: These tests may take 30-60 seconds as they make real API calls to sandbox.

---

## 3. Manual Testing

### 3.1 Admin Gateway Configuration

**Steps**:
1. Login to admin app: `http://localhost:5173`
2. Navigate to "Payment Gateways" (new menu item)
3. Verify all 3 gateways visible (PhonePe, Razorpay, Paytm)
4. Click "Configure" on PhonePe
5. Enter sandbox credentials:
   - Merchant ID: `PGTESTPAYUAT`
   - Salt Key: `099eb0cd-02cf-4e2a-8aca-3e6c6aff0399`
   - Salt Index: `1`
6. Save and verify success toast
7. Toggle "Enabled" switch ON
8. Verify gateway card shows "Enabled" badge

**Expected Result**: PhonePe gateway configured and enabled successfully.

---

### 3.2 Customer Checkout - PhonePe Payment

**Steps**:
1. Login to customer app: `http://localhost:5174`
2. Add products to cart (total > ₹100)
3. Go to `/checkout`
4. Select delivery address
5. Click "Online Payment"
6. Verify PhonePe appears in gateway selector
7. Select PhonePe
8. Click "Place Order"
9. You will be redirected to PhonePe sandbox page
10. Complete test payment using PhonePe test credentials
11. After redirection back, verify order confirmation page

**Expected Result**:
- Payment successful
- Order status: CONFIRMED
- Payment record created in database

**Database Verification**:
```bash
# Check payment record
db.payments.findOne({ orderId: ObjectId("...") })
# Status should be "SUCCESS"

# Check order
db.orders.findOne({ _id: ObjectId("...") })
# paymentStatus should be "COMPLETED"
# orderStatus should be "CONFIRMED"
```

---

### 3.3 Payment Failure Handling

**Steps**:
1. Follow steps 1-8 from 3.2
2. On PhonePe page, click "Cancel" or use failure test card
3. Verify redirect back to customer app shows error message
4. Check payment status in database (should be FAILED)
5. Check order status (should remain PENDING)

**Expected Result**: Failed payment doesn't confirm order.

---

### 3.4 Webhook Processing Test

**Prerequisites**: Use ngrok to expose local backend or deploy to staging

**Steps**:
1. Configure webhook URL in PhonePe dashboard:
   `https://your-ngrok-url.ngrok.io/api/v1/webhook/phonepe`
2. Complete a payment (follow 3.2)
3. Check `webhook_logs` collection:
   ```bash
   db.webhook_logs.find({ provider: 'phonepe' }).sort({ createdAt: -1 }).limit(1)
   ```
4. Verify:
   - `signatureValid: true`
   - `processed: true`
   - `paymentId` field populated

**Expected Result**: Webhook received and processed successfully.

---

### 3.5 Admin Refund Initiation

**Steps**:
1. In admin app, go to "Payments"
2. Find a successful payment
3. Click "View Details"
4. Click "Initiate Refund"
5. Enter amount (e.g., full amount)
6. Select reason: "Customer Request"
7. Add notes: "Test refund"
8. Click "Confirm"
9. Wait 10-30 seconds for gateway processing
10. Refresh payment details
11. Verify refund status is SUCCESS

**Expected Result**:
- Refund created in `payment_refunds` collection
- Gateway refund ID populated
- Payment status updated to REFUNDED

---

## 4. End-to-End Testing (Optional)

### Browser Automation

If you want automated E2E tests, create:

**File**: `backend/src/tests/e2e/paymentFlow.e2e.test.ts`

Using Playwright:
```typescript
test('Complete payment flow - PhonePe', async ({ page }) => {
  // Login
  await page.goto('http://localhost:5174/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Add to cart
  await page.goto('http://localhost:5174/products/test-product-id');
  await page.click('button:has-text("Add to Cart")');
  
  // Checkout
  await page.goto('http://localhost:5174/checkout');
  await page.click('button:has-text("Online Payment")');
  await page.click('[data-gateway="phonepe"]');
  await page.click('button:has-text("Place Order")');
  
  // Wait for redirect to PhonePe (in test, we mock this)
  // ... complete payment simulation
  
  // Verify order confirmation
  await expect(page.locator('text=Order Confirmed')).toBeVisible();
});
```

**Command**:
```bash
cd backend
npx playwright test paymentFlow.e2e.test.ts
```

**Note**: E2E tests require more setup. Let me know if you want this implemented.

---

## 5. Load Testing

### Webhook Load Test

Simulate high webhook traffic:

**File**: `backend/src/tests/load/webhookLoad.test.ts`

Using Artillery or k6:
```yaml
# artillery.yml
config:
  target: 'http://localhost:8000'
  phases:
    - duration: 60
      arrivalRate: 10 # 10 requests/second

scenarios:
  - name: 'PhonePe Webhook'
    flow:
      - post:
          url: '/api/v1/webhook/phonepe'
          headers:
            X-VERIFY: '{{ validSignature }}'
          json:
            merchantId: 'MERCHANT'
            transactionId: '{{ $randomString() }}'
            code: 'PAYMENT_SUCCESS'
```

**Command**:
```bash
artillery run artillery.yml
```

**Success Criteria**:
- All webhooks processed
- No duplicate processing errors
- P95 latency < 500ms

---

## 6. Security Testing

### 6.1 Webhook Signature Validation

**Test**: Send webhook with invalid signature

```bash
curl -X POST http://localhost:8000/api/v1/webhook/phonepe \
  -H "X-VERIFY: invalid_signature" \
  -H "Content-Type: application/json" \
  -d '{"merchantId":"M123","code":"PAYMENT_SUCCESS"}'
```

**Expected**: Webhook rejected, logged with `signatureValid: false`

---

### 6.2 Idempotency Test

**Test**: Try to initiate payment twice for same order

```bash
# First request
curl -X POST http://localhost:8000/api/v1/customer/payment/initiate \
  -H "Authorization: Bearer <JWT>" \
  -d '{"orderId":"order_123","gatewayName":"phonepe"}'

# Second request (same order)
curl -X POST http://localhost:8000/api/v1/customer/payment/initiate \
  -H "Authorization: Bearer <JWT>" \
  -d '{"orderId":"order_123","gatewayName":"phonepe"}'
```

**Expected**: Second request returns existing payment or error (no duplicate payment created)

---

## 7. Backward Compatibility Testing

### COD Orders

**Test**: Create COD order after payment gateway deployment

**Steps**:
1. Complete checkout with "Cash on Delivery" selected
2. Verify order created successfully
3. Verify NO payment record created
4. Verify order status flow works as before

**Expected**: COD orders completely unaffected by new code.

---

## Test Coverage Target

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All gateway services tested
- **Manual Tests**: All critical user paths verified
- **E2E Tests**: Optional (1-2 happy paths)

---

## CI/CD Integration

Add to `.github/workflows/test.yml`:

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - name: Install dependencies
      run: cd backend && npm install
    - name: Run unit tests
      run: cd backend && npm test
    - name: Run integration tests
      run: cd backend && NODE_ENV=test npm run test:integration
      env:
        PHONEPE_MERCHANT_ID: ${{ secrets.PHONEPE_TEST_MERCHANT_ID }}
        RAZORPAY_KEY_ID: ${{ secrets.RAZORPAY_TEST_KEY_ID }}
```

---

## Testing Checklist

Before deploying to production:

- [ ] All unit tests passing
- [ ] All integration tests passing (sandbox)
- [ ] Manual testing on all 3 gateways completed
- [ ] Webhook processing verified (with ngrok/staging)
- [ ] Refund flow tested successfully
- [ ] COD backward compatibility verified
- [ ] Security tests passed (invalid signatures rejected)
- [ ] Load testing completed (if applicable)
- [ ] Admin can configure gateways without errors
- [ ] Customer can select and pay via all enabled gateways

---

**Ready for Testing**: Test plan complete. All tests can be executed after Phase 2 (Backend) is implemented.
