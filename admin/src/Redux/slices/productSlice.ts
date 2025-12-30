import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IProduct } from '../../types';

export interface ProductState {
  products: IProduct[];
  currentProduct: IProduct | null;
  loading: boolean;
  totalRecords: number;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  loading: false,
  totalRecords: 0,
  error: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setProducts: (state, action: PayloadAction<{ products: IProduct[]; totalRecords: number }>) => {
      state.products = action.payload.products;
      state.totalRecords = action.payload.totalRecords;
      state.loading = false;
      state.error = null;
    },
    setCurrentProduct: (state, action: PayloadAction<IProduct | null>) => {
      state.currentProduct = action.payload;
    },
    addProduct: (state, action: PayloadAction<IProduct>) => {
      state.products.unshift(action.payload);
      state.totalRecords += 1;
    },
    updateProduct: (state, action: PayloadAction<IProduct>) => {
       const index = state.products.findIndex((prod) => prod._id === action.payload._id);
       if (index !== -1) {
         state.products[index] = action.payload;
       }
       if (state.currentProduct && state.currentProduct._id === action.payload._id) {
           state.currentProduct = action.payload;
       }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((prod) => prod._id !== action.payload);
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
  setProducts, 
  setCurrentProduct, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  setError 
} = productSlice.actions;

export default productSlice.reducer;
