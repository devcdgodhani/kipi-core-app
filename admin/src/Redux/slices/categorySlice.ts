import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ICategory } from '../../types';

export interface CategoryState {
  tree: ICategory[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  tree: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCategoryTree: (state, action: PayloadAction<ICategory[]>) => {
      state.tree = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { 
  setLoading, 
  setCategoryTree, 
  setError 
} = categorySlice.actions;

export default categorySlice.reducer;
