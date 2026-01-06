# Delivery ETA Engine: Calculation & Logic

The Delivery ETA Engine provides predictive delivery dates by blending static service level agreements (SLA) with dynamic routing factors and real-world historical performance.

## 1. Multi-Factor Calculation

The Estimated Days are calculated using the following weighted algorithm:

### A. Base SLA (Courier Capacity)
- **Courier SLA Range:** `[minSla, maxSla]`
- **Calculation:** `Math.ceil((minSla + maxSla) / 2)`

### B. Zone Adjustment (Routing Factor)
We use a proxy distance calculation based on the difference in the first digit of the pincodes (Zone Proxy).
- **Intra-Zone (Same first digit):** -1 Day
- **Diff of 1-3:** +1 Day
- **Diff of 4+:** +2 Days
- **Formula:** `zoneDiff === 0 ? -1 : Math.ceil(zoneDiff / 2)`

### C. Historical Performance (Closed Loop)
The engine queries the `ShipmentModel` for the last 50 deliveries to the same pincode zone (first 3 digits).
- **Weighting:** 60% History / 40% Predicted SLA.
- **Formula:** `(Predicted_Days * 0.4) + (Historical_Avg_Days * 0.6)`

### D. Seasonality Buffer
Allows for global adjustments during high-traffic periods.
- **Peak Season (Oct - Dec):** +1 Day Buffer.
- **Normal:** +0 Days.

---

## 2. Confidence Matrix

Every prediction is assigned a confidence level based on the sample size of historical data:

| Confidence Level | Sample Size (Recent Shipments) | Reliability Description |
| :--- | :--- | :--- |
| **HIGH** | > 20 shipments | Very reliable; based on consistent recent performance. |
| **MEDIUM** | 5 - 20 shipments | Relatable; based on moderate recent history. |
| **LOW** | < 5 shipments | Speculative; primarily based on courier SLA and distance proxy. |

---

## 3. Data Integration

1.  **Courier Model:** Provides the static `slaMin` and `slaMax` benchmarks.
2.  **Shipment Model:** Provides the ground truth (`actualDeliveryDate` - `pickupCompletedDate`).
3.  **Real-Time API:** Accessible via `/customer/eta/check` (Public) and `/admin/eta/calculate` (Authenticated).
