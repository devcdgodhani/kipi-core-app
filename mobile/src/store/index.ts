import { configureStore } from '@reduxjs/toolkit';

// Placeholder store - we'll add slices as needed
export const store = configureStore({
  reducer: {
    // Add reducers here as needed
    _dummy: (state = {}) => state,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
