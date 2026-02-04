import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isInitialized: boolean;
}

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('ACCESS_TOKEN');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  loading: false,
  isInitialized: false,
};

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (!token) return null;

    try {
      const response = await authService.getMe();
      const user = response?.data || response;
      return user;
    } catch (error: any) {
      if (error.response?.status === 401) {
        dispatch(logout());
      }
      throw error;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('ACCESS_TOKEN', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('REFRESH_TOKEN');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.isInitialized = true;
      });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
