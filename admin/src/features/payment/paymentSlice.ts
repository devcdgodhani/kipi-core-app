import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { paymentService } from '../../services/paymentService';
import type {
  PaymentGateway,
  PaymentGatewayName,
  UpdateGatewayPayload,
  WebhookLog,
  WebhookLogFilters,
} from '../../types/payment';

interface PaymentState {
  gateways: PaymentGateway[];
  webhookLogs: WebhookLog[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  gateways: [],
  webhookLogs: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchGateways = createAsyncThunk('payment/fetchGateways', async () => {
  return await paymentService.getAllGateways();
});

export const updateGateway = createAsyncThunk(
  'payment/updateGateway',
  async ({ name, payload }: { name: PaymentGatewayName; payload: UpdateGatewayPayload }) => {
    return await paymentService.updateGateway(name, payload);
  }
);

export const toggleGateway = createAsyncThunk(
  'payment/toggleGateway',
  async ({ name, isEnabled }: { name: PaymentGatewayName; isEnabled: boolean }) => {
    await paymentService.toggleGateway(name, isEnabled);
    return { name, isEnabled };
  }
);

export const fetchWebhookLogs = createAsyncThunk(
  'payment/fetchWebhookLogs',
  async (filters?: WebhookLogFilters) => {
    return await paymentService.getWebhookLogs(filters);
  }
);

export const retryWebhook = createAsyncThunk('payment/retryWebhook', async (id: string) => {
  await paymentService.retryWebhook(id);
  return id;
});

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch gateways
    builder
      .addCase(fetchGateways.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGateways.fulfilled, (state, action: PayloadAction<PaymentGateway[]>) => {
        state.loading = false;
        state.gateways = action.payload;
      })
      .addCase(fetchGateways.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch gateways';
      });

    // Update gateway
    builder
      .addCase(updateGateway.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGateway.fulfilled, (state, action: PayloadAction<PaymentGateway>) => {
        state.loading = false;
        const index = state.gateways.findIndex((g) => g._id === action.payload._id);
        if (index !== -1) {
          state.gateways[index] = action.payload;
        }
      })
      .addCase(updateGateway.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update gateway';
      });

    // Toggle gateway
    builder
      .addCase(toggleGateway.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        toggleGateway.fulfilled,
        (state, action: PayloadAction<{ name: PaymentGatewayName; isEnabled: boolean }>) => {
          state.loading = false;
          const gateway = state.gateways.find((g) => g.name === action.payload.name);
          if (gateway) {
            gateway.isEnabled = action.payload.isEnabled;
          }
        }
      )
      .addCase(toggleGateway.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to toggle gateway';
      });

    // Fetch webhook logs
    builder
      .addCase(fetchWebhookLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWebhookLogs.fulfilled, (state, action: PayloadAction<WebhookLog[]>) => {
        state.loading = false;
        state.webhookLogs = action.payload;
      })
      .addCase(fetchWebhookLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch webhook logs';
      });

    // Retry webhook
    builder
      .addCase(retryWebhook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(retryWebhook.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(retryWebhook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to retry webhook';
      });
  },
});

export const { clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
