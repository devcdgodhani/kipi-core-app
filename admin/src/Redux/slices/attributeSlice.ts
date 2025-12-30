import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IAttribute } from '../../types';

export interface AttributeState {
  attributes: IAttribute[];
  loading: boolean;
  totalRecords: number;
  error: string | null;
}

const initialState: AttributeState = {
  attributes: [],
  loading: false,
  totalRecords: 0,
  error: null,
};

const attributeSlice = createSlice({
  name: 'attribute',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAttributes: (state, action: PayloadAction<{ attributes: IAttribute[]; totalRecords?: number }>) => {
      state.attributes = action.payload.attributes;
      if (action.payload.totalRecords !== undefined) {
        state.totalRecords = action.payload.totalRecords;
      }
      state.loading = false;
      state.error = null;
    },
    addAttribute: (state, action: PayloadAction<IAttribute>) => {
      state.attributes.unshift(action.payload);
      state.totalRecords += 1;
    },
    updateAttribute: (state, action: PayloadAction<IAttribute>) => {
      const index = state.attributes.findIndex((attr) => attr._id === action.payload._id);
      if (index !== -1) {
        state.attributes[index] = action.payload;
      }
    },
    deleteAttribute: (state, action: PayloadAction<string>) => {
      state.attributes = state.attributes.filter((attr) => attr._id !== action.payload);
      state.totalRecords -= 1;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { 
  setLoading, 
  setAttributes, 
  addAttribute, 
  updateAttribute, 
  deleteAttribute, 
  setError 
} = attributeSlice.actions;

export default attributeSlice.reducer;
