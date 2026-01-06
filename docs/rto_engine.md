# RTO Reduction Engine: Formula & Logic

The RTO (Return to Origin) Reduction Engine is a proactive risk assessment system designed to minimize logistics losses by predicting the likelihood of a customer returning a shipment before it is processed.

## 1. Core Scoring Formula

The risk score (0-100) is calculated based on four primary factors:

### F1: Customer History (Weight: High)
- **New Customer (0 orders):** Base Risk = 40 (Neutral-Medium)
- **Positive History (>2 successful deliveries, 0 RTOs):** Risk = 0
- **Negative History (>0 RTOs):** Risk = 90 (Major Red Flag)

### F2: Pincode Risk (Weight: Critical)
- **Blacklisted Pincodes:** Risk = 100 (Immediate Critical)
- **High-Risk Zones (Global/System aggregation):** Dynamic calculation based on RTO rate of all shipments to that pincode.
- **Formula:** `(RTO Count / Total Shipments) * 100` (min 5 shipments for data validity).

### F3: Order Value & Payment (Weight: Medium)
- **COD + Value > ₹5,000:** +70 Risk Factor.
- **Prepaid Orders:** 0 Risk Factor (Payment is already secured).

### F4: Account Age (Weight: Low)
- **Account < 30 days old:** +40 Risk Factor.

---

## 2. Decision Logic

The `riskScore` is the sum of weighted factors, capped at 100.

| Risk Level | Score Range | Suggested Action | Impact on Order |
| :--- | :--- | :--- | :--- |
| **LOW** | 0 - 29 | `ALLOW` | Order confirmed immediately. |
| **MEDIUM** | 30 - 59 | `FLAG` | Order held in `PENDING` for optional review. |
| **HIGH** | 60 - 89 | `FLAG` | Order held in `PENDING` for mandatory manual confirmation. |
| **CRITICAL** | 90 - 100 | `BLOCK_COD` | **COD option disabled.** Customer forced to pay online or order rejected. |

---

## 3. Automated Training (Closed-Loop)

The system automatically refines customer risk profiles after every delivery event:
1. **Webhook Reception:** Carrier sends `DELIVERED` or `RTO`.
2. **Metric Update:** `UserModel.metrics` increments `deliveredCount` or `rtoCount`.
3. **Future Scoring:** Subsequent orders by the same user will use updated metrics for calculation.
