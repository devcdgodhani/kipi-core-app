import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { paymentService } from '../../services/paymentService';
import type { Payment, Refund, PaymentGatewayOption } from '../../types/payment';

interface PaymentState {
  gateways: PaymentGatewayOption[];
  myPayments: Payment[];
  myRefunds: Refund[];
  currentPayment: Payment | null;
  currentRefund: Refund | null;
  loading: boolean;
  error: string | null;
  paymentInitiating: boolean;
  refundInitiating: boolean;
}

const initialState: PaymentState = {
  gateways: [],
  myPayments: [],
  myRefunds: [],
  currentPayment: null,
  currentRefund: null,
  loading: false,
  error: null,
  paymentInitiating: false,
  refundInitiating: false,
};

// Async Thunks

export const fetchEnabledGateways = createAsyncThunk(
  'payment/fetchEnabledGateways',
  async (_, { rejectWithValue }) => {
    try {
      return await paymentService.getEnabledGateways();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gateways');
    }
  }
);

export const initiatePayment = createAsyncThunk(
  'payment/initiate',
  async ({ orderId, gatewayName }: { orderId: string; gatewayName: string }, { rejectWithValue }) => {
    try {
      return await paymentService.initiatePayment(orderId, gatewayName);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate payment');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payment/verify',
  async ({ paymentId, gatewayData }: { paymentId: string; gatewayData: any }, { rejectWithValue }) => {
    try {
      return await paymentService.verifyPayment(paymentId, gatewayData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify payment');
    }
  }
);

export const fetchMyPayments = createAsyncThunk(
  'payment/fetchMyPayments',
  async ({ limit, skip }: { limit?: number; skip?: number }, { rejectWithValue }) => {
    try {
      return await paymentService.getMyPayments(limit, skip);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const fetchMyRefunds = createAsyncThunk(
  'payment/fetchMyRefunds',
  async ({ limit, skip }: { limit?: number; skip?: number }, { rejectWithValue }) => {
    try {
      return await paymentService.getMyRefunds(limit, skip);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch refunds');
    }
  }
);

export const initiateRefund = createAsyncThunk(
  'payment/initiateRefund',
  async ({ paymentId, amount, reason, notes }: { paymentId: string; amount: number; reason: string; notes?: string }, { rejectWithValue }) => {
    try {
      return await paymentService.initiateRefund(paymentId, amount, reason, notes);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate refund');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetPaymentState: (state) => {
      state.paymentInitiating = false;
      state.currentPayment = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Gateways
    builder
      .addCase(fetchEnabledGateways.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnabledGateways.fulfilled, (state, action) => {
        state.loading = false;
        state.gateways = action.payload;
      })
      .addCase(fetchEnabledGateways.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Initiate Payment
    builder
      .addCase(initiatePayment.pending, (state) => {
        state.paymentInitiating = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.paymentInitiating = false;
        // Handling redirect usually handled in component, but we store data if needed
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.paymentInitiating = false;
        state.error = action.payload as string;
      });

    // Verify Payment
    builder
      .addCase(verifyPayment.fulfilled, (state, action) => {
        // Update payment status in list if present
        if (action.payload.data) {
           const index = state.myPayments.findIndex(p => p._id === action.payload.data?._id);
           if (index !== -1) {
             state.myPayments[index] = action.payload.data;
           }
        }
      });

    // Fetch My Payments
    builder
      .addCase(fetchMyPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.myPayments = action.payload;
      })
      .addCase(fetchMyPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
      
    // Fetch My Refunds
    builder
      .addCase(fetchMyRefunds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyRefunds.fulfilled, (state, action) => {
        state.loading = false;
        state.myRefunds = action.payload;
      })
      .addCase(fetchMyRefunds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Initiate Refund
    builder
      .addCase(initiateRefund.pending, (state) => {
        state.refundInitiating = true;
        state.error = null;
      })
      .addCase(initiateRefund.fulfilled, (state, action) => {
        state.refundInitiating = false;
        state.myRefunds.unshift(action.payload);
      })
      .addCase(initiateRefund.rejected, (state, action) => {
        state.refundInitiating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
