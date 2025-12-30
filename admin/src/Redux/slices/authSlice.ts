import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IUser } from '../../types';
import { TokenManager } from '../../api/middleware/TokenManager';

export interface AuthState {
  user: IUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: TokenManager.getAccessToken(),
  refreshToken: TokenManager.getRefreshToken(),
  isAuthenticated: !!TokenManager.getAccessToken(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setLoginSuccess: (
      state,
      action: PayloadAction<{ user: IUser; token: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    setLoginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.isAuthenticated = false;
    },
    updateUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      TokenManager.clearTokens();
    },
  },
});

export const { setLoading, setLoginSuccess, setLoginFailure, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
