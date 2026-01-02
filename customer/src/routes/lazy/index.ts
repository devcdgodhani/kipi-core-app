import { lazy } from 'react';

export const LoginLazy = lazy(() => import('../../pages/Auth/Login'));
export const RegisterLazy = lazy(() => import('../../pages/Auth/Register'));
export const VerifyOTPLazy = lazy(() => import('../../pages/Auth/VerifyOTP'));
export const HomeLazy = lazy(() => import('../../pages/Home/Home'));
export const ProductListLazy = lazy(() => import('../../pages/Products/ProductList'));
export const ProductDetailsLazy = lazy(() => import('../../pages/Products/ProductDetails'));
export const WishlistLazy = lazy(() => import('../../pages/Wishlist/WishlistPage'));
export const AddressesLazy = lazy(() => import('../../pages/Address/ManageAddresses'));
export const CheckoutLazy = lazy(() => import('../../pages/Checkout/CheckoutPage'));
export const OrdersLazy = lazy(() => import('../../pages/Orders/Orders'));
export const ProfileLazy = lazy(() => import('../../pages/Profile/Profile'));
export const ChangePasswordLazy = lazy(() => import('../../pages/Auth/ChangePassword'));
export const ForgotPasswordLazy = lazy(() => import('../../pages/Auth/ForgotPassword'));
export const ResetPasswordLazy = lazy(() => import('../../pages/Auth/ResetPassword'));
export const NotFoundLazy = lazy(() => import('../../pages/NotFound'));
