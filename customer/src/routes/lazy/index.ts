import { lazy } from 'react';

export const LoginLazy = lazy(() => import('../../pages/Auth/Login'));
export const HomeLazy = lazy(() => import('../../pages/Home/Home'));
export const ProductListLazy = lazy(() => import('../../pages/Products/ProductList'));
export const ProductDetailsLazy = lazy(() => import('../../pages/Products/ProductDetails'));
export const OrdersLazy = lazy(() => import('../../pages/Orders/Orders'));
export const ProfileLazy = lazy(() => import('../../pages/Profile/Profile'));
