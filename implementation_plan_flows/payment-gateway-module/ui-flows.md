# UI Flows - Payment Gateway Module

This document describes all user interface flows for both Customer and Admin applications.

---

## Customer App Flows

### Flow 1: Checkout with Payment Gateway Selection

**Pages**: `CheckoutPage.tsx`, `PaymentRedirect.tsx`, `PaymentStatus.tsx`, `OrderConfirmation.tsx`

#### Steps

1. **User adds products to cart** → Navigates to `/checkout`

2. **CheckoutPage renders**:
   - Shows delivery address selection
   - Shows payment method selector:
     - **COD** button (existing)
     - **Online Payment** button (modified)

3. **User selects "Online Payment"**:
   - Triggers API call: `GET /api/v1/customer/payment-gateway/active`
   - Response: List of enabled gateways (PhonePe, Razorpay, Paytm)
   - UI displays gateway selection modal/section:
     - Gateway cards with logos
     - Trust badges ("Secure Payment", "100% Safe")

4. **User selects a gateway** (e.g., PhonePe):
   - Selected gateway highlighted
   - "Place Order" button enabled

5. **User clicks "Place Order"**:
   - Loading spinner shown
   - API call: `POST /api/v1/customer/checkout/create-order`
     - Request includes selected gateway name
   - Response: Order created with status `PENDING`
   - Immediately call: `POST /api/v1/customer/payment/initiate`
     - Request: `{orderId, gatewayName: 'phonepe'}`
     - Response: `{paymentId, redirectUrl}`

6. **Redirect to gateway**:
   - Opens `redirectUrl` in same tab
   - User completes payment on PhonePe's page

7. **Gateway redirects back**:
   - URL: `https://yourdomain.com/payment/callback?paymentId=xxx&status=success`
   - `PaymentRedirect.tsx` page loads

8. **PaymentRedirect page**:
   - Parses query params
   - Shows loading spinner: "Verifying payment..."
   - API call: `POST /api/v1/customer/payment/verify`
     - Request: `{paymentId, gatewayData: {...query params}}`
   - Response:
     - **Success**: Payment verified, order confirmed
     - **Failure**: Payment failed

9. **On success**:
   - Redirect to `/order-confirmation?orderId=xxx`
   - Show success message with order details

10. **On failure**:
    - Show error modal: "Payment failed. Please try again."
    - Option to retry payment or return to cart

---

### Flow 2: Payment Status Polling (Slow Webhooks)

**Page**: `PaymentStatus.tsx`

If webhook is delayed and payment status is still `PENDING` after redirect:

1. **PaymentStatus page**:
   - Shows animated loader: "Processing payment..."
   - Polls every 3 seconds: `GET /api/v1/customer/payment/:id`

2. **Polling logic**:
   - Max 10 attempts (30 seconds total)
   - If status becomes `SUCCESS` → Redirect to order confirmation
   - If status becomes `FAILED` → Show error
   - If timeout → Show "Payment processing, check back later"

---

### Flow 3: View Payment Details in Order History

**Page**: `OrderDetails.tsx`

1. User navigates to `/orders/:id`

2. **OrderDetails page**:
   - Existing order information displayed
   - **NEW**: Payment Information Section added:
     - Payment method (COD or "Paid via PhonePe")
     - Payment status badge:
       - ✅ Success (green)
       - ⏳ Pending (yellow)
       - ❌ Failed (red)
     - Transaction ID (if available, with copy button)

3. **For failed payments**:
   - Show "Retry Payment" button
   - Clicking triggers new payment initiation flow

---

## Admin App Flows

### Flow 4: Configure Payment Gateway

**Page**: `PaymentGatewayConfig.tsx`

1. **Admin navigates to "Payment Gateways"** (new sidebar menu)

2. **PaymentGatewayConfig page renders**:
   - Header: "Payment Gateway Configuration"
   - Table/grid showing all gateways:
     - PhonePe card
     - Razorpay card
     - Paytm card
   - Each card shows:
     - Gateway logo and name
     - Status toggle (Enabled/Disabled)
     - Environment badge (Sandbox/Production)
     - "Configure" button

3. **Admin clicks "Configure" on PhonePe**:
   - Modal opens: "Configure PhonePe Gateway"
   - Form fields:
     - **Environment**: Dropdown (Sandbox, Production)
     - **Merchant ID**: Text input (masked if saved)
     - **Salt Key**: Password input (masked)
     - **Salt Index**: Number input
     - **Webhook Secret**: Password input (masked)
     - **Priority**: Number input (display order)
   - Save button

4. **Admin enters credentials and clicks "Save"**:
   - Loading spinner on button
   - API call: `PUT /api/v1/admin/payment-gateway/:id/update`
   - Response:
     - **Success**: Show success toast, modal closes, list refreshes
     - **Error**: Show error toast

5. **Admin toggles "Enabled" switch**:
   - API call: `PUT /api/v1/admin/payment-gateway/:id/toggle`
   - Immediate UI update, success toast

---

### Flow 5: View and Filter Payments

**Page**: `PaymentManagement.tsx`

1. **Admin navigates to "Payments"** (new sidebar menu)

2. **PaymentManagement page renders**:
   - Header with total payment statistics:
     - Total payments today
     - Total amount collected
     - Success rate
   - Filter panel:
     - Date range picker
     - Gateway dropdown (All, PhonePe, Razorpay, Paytm)
     - Status dropdown (All, Success, Pending, Failed)
     - Order ID search
   - DataTable with columns:
     - Order Number (clickable → order details)
     - Payment ID
     - Customer Name
     - Gateway (badge with icon)
     - Amount
     - Status (colored badge)
     - Payment Date
     - Actions (View Details, Copy Transaction ID)

3. **Admin applies filters**:
   - Select date range: Last 7 days
   - Select gateway: PhonePe
   - Select status: Success
   - Click "Apply Filters"
   - API call: `POST /api/v1/admin/payment/getAll` with filters
   - Table updates with filtered results

4. **Admin clicks "View Details" on a payment**:
   - Modal opens: `PaymentDetailsModal`
   - Shows:
     - Full payment information
     - Gateway response (JSON viewer)
     - Payment timeline (created, initiated, success timestamps)
     - Associated order details (link)
     - Webhook logs for this payment
     - Refund section (if applicable)

---

### Flow 6: Initiate Refund

**Page**: `PaymentDetails.tsx` or `RefundManagement.tsx`

1. **Admin views successful payment details**

2. **Admin clicks "Initiate Refund" button**:
   - `RefundModal` opens
   - Form fields:
     - **Refund Amount**: Number input
       - Max value: Payment amount minus already refunded amount
       - Displays: "Available: ₹1500.00"
     - **Reason**: Dropdown
       - Options: Customer Request, Return, RTO, Quality Issue, Other
     - **Notes**: Textarea (optional)
   - Display total refundable amount
   - "Full Refund" quick button (fills amount automatically)

3. **Admin enters refund details and clicks "Confirm Refund"**:
   - Confirmation dialog: "Are you sure you want to refund ₹500.00?"
   - On confirm:
     - Loading spinner
     - API call: `POST /api/v1/admin/refund/initiate`
     - Response:
       - **Success**: Show success toast, refund appears in list
       - **Error**: Show error toast with message

4. **Refund status updates**:
   - Initial status: "Pending" (yellow badge)
   - Webhook updates status to "Success" (green badge)
   - If failed: "Failed" (red badge) with "Retry" button

5. **Admin views refund history**:
   - Table showing all refunds for this payment:
     - Refund ID
     - Amount
     - Reason
     - Status
     - Initiated By (admin name)
     - Initiated Date
     - Completed Date

---

### Flow 7: Monitor Webhook Logs

**Page**: `WebhookLogs.tsx` (new) or section in `PaymentDetails.tsx`

1. **Admin navigates to "Webhook Logs"** or views payment details

2. **Webhook logs table**:
   - Columns:
     - Timestamp
     - Gateway
     - Event Type (payment.success, refund.success)
     - Payment ID (link)
     - Signature Valid (✓/✗)
     - Processed (Yes/No)
     - Processing Time (ms)
   - Filter by gateway, date, processed status

3. **Admin clicks on a webhook log**:
   - Modal shows:
     - Full webhook payload (JSON viewer)
     - Request headers
     - Signature verification result
     - Processing errors (if any)
     - Retry count

---

## UI Components

### New Components

#### 1. **GatewaySelector** (Customer)
- **File**: `customer/src/components/Payment/GatewaySelector.tsx`
- **Props**: `gateways[], selectedGateway, onSelect(gateway)`
- **UI**:
  - Grid of gateway cards
  - Each card has: logo, name, "Secure" badge
  - Selected card has border highlight
  - Radio button or checkmark

#### 2. **PaymentStatusBadge** (Customer & Admin)
- **File**: `common/PaymentStatusBadge.tsx`
- **Props**: `status: 'SUCCESS' | 'PENDING' | 'FAILED'`
- **UI**:
  - Color-coded badge (green/yellow/red)
  - Icon (checkmark/clock/cross)
  - Animated pulse for PENDING

#### 3. **GatewayCard** (Admin)
- **File**: `admin/src/components/payment/GatewayCard.tsx`
- **Props**: `gateway: IPaymentGateway, onConfigure, onToggle`
- **UI**:
  - Card with gateway logo
  - Status toggle switch (top-right)
  - Environment badge (Sandbox/Production)
  - "Configure" button
  - Shows last updated date

#### 4. **PaymentDetailsModal** (Admin)
- **File**: `admin/src/components/payment/PaymentDetailsModal.tsx`
- **Props**: `paymentId, isOpen, onClose`
- **UI**:
  - Modal with tabs:
    - **Details**: Payment info, timeline
    - **Webhooks**: Webhook logs for this payment
    - **Refunds**: Refund history
  - Copy buttons for transaction IDs
  - Link to associated order

#### 5. **RefundModal** (Admin)
- **File**: `admin/src/components/payment/RefundModal.tsx`
- **Props**: `payment, onSubmit, onClose`
- **UI**:
  - Form with amount, reason, notes
  - Max validation display
  - "Full Refund" quick action
  - Confirmation step before submit

---

## Wireframes / UI Mockups

### Customer: Checkout Payment Gateway Selection

```
┌─────────────────────────────────────────┐
│         Checkout - Payment Method       │
├─────────────────────────────────────────┤
│                                         │
│  ○ Cash on Delivery (COD)               │
│     Pay at your doorstep                │
│                                         │
│  ● Online Payment                       │
│     Cards, UPI, Wallets, Netbanking     │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Select Payment Gateway          │  │
│  ├──────────────────────────────────┤  │
│  │  ┌─────┐  ┌─────┐  ┌─────┐       │  │
│  │  │ [P] │  │ [R] │  │ [T] │       │  │
│  │  │PhonePe Razorpay  Paytm        │  │
│  │  │ ✓   │  │     │  │     │       │  │
│  │  └─────┘  └─────┘  └─────┘       │  │
│  │  Selected: PhonePe               │  │
│  │  🔒 100% Secure Payment          │  │
│  └──────────────────────────────────┘  │
│                                         │
│  [     Place Order →     ]              │
│                                         │
└─────────────────────────────────────────┘
```

---

### Admin: Payment Gateway Configuration

```
┌─────────────────────────────────────────────────┐
│   Payment Gateways                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │  PhonePe    │  │  Razorpay   │  │  Paytm  │ │
│  │  [Logo]     │  │  [Logo]     │  │ [Logo]  │ │
│  │  ●Enabled▼  │  │  ○Disabled▼ │  │ ○Off ▼  │ │
│  │             │  │             │  │         │ │
│  │  🟢 Sandbox │  │  🔴 Production│ │⚫ N/A   │ │
│  │             │  │             │  │         │ │
│  │ [Configure] │  │ [Configure] │  │[Configure]
│  └─────────────┘  └─────────────┘  └─────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘

(Click Configure opens modal with credential form)
```

---

### Admin: Payment Management Table

```
┌──────────────────────────────────────────────────────────────┐
│  Payments                        Filter: [Date▼] [Gateway▼]  │
├──────────────────────────────────────────────────────────────┤
│ Order #    │ Payment ID │ Amount  │ Gateway  │ Status │ Date │
├────────────┼────────────┼─────────┼──────────┼────────┼──────┤
│ ORD-001    │ PAY-123   │ ₹1500   │ 📱PhonePe│ ✅Success│ Today│
│ ORD-002    │ PAY-124   │ ₹2500   │ 💳Razorpay│ ✅Success│ Today│
│ ORD-003    │ PAY-125   │ ₹1000   │ 📱Paytm  │ ⏳Pending│ Today│
│ ORD-004    │ PAY-126   │ ₹3000   │ 📱PhonePe│ ❌Failed │ Yesterday│
└──────────────────────────────────────────────────────────────┘

(Click row opens PaymentDetailsModal)
```

---

## Dark Mode Support

All new UI components must support dark mode (existing pattern in app):

- **Customer App**: Uses Tailwind's dark mode classes
- **Admin App**: Uses Tailwind's dark mode classes
- **Colors**:
  - Success: `bg-green-100 dark:bg-green-900`
  - Pending: `bg-yellow-100 dark:bg-yellow-900`
  - Failed: `bg-red-100 dark:bg-red-900`
  - Cards: `bg-white dark:bg-gray-800`
  - Text: `text-gray-900 dark:text-gray-100`

---

## Accessibility (a11y)

All payment UI components must follow:

- Keyboard navigation (Tab, Enter, Esc)
- Screen reader labels (aria-label, aria-describedby)
- Focus states visible
- Color contrast ratio ≥ 4.5:1
- Error messages announced to screen readers
- Loading states announced

---

## Responsive Design

All pages must be mobile-responsive:

### CheckoutPage (Customer)
- Desktop: Two-column layout (address + summary)
- Mobile: Single column, sticky footer for "Place Order"
- Gateway selector: Horizontal scroll on mobile

### PaymentManagement (Admin)
- Desktop: Full table view
- Tablet: Horizontal scroll for table
- Mobile: Card view instead of table

---

## Animation & Transitions

- **Payment processing**: Animated spinner with "Verifying payment..." text
- **Success**: Checkmark animation (scale + fade in)
- **Failed**: Shake animation on error badge
- **Gateway selection**: Smooth border highlight on select
- **Modal open/close**: Fade + slide from bottom

---

**Status**: ✅ UI Flows Complete
