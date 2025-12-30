import { lazy } from 'react';

export const LoginLazy = lazy(() => import('../../pages/Auth/Login'));
export const RegisterLazy = lazy(() => import('../../pages/Auth/Register'));
export const VerifyOTPLazy = lazy(() => import('../../pages/Auth/VerifyOTP'));
export const DashboardLazy = lazy(() => import('../../pages/Dashboard/Index'));
export const ManageProductsLazy = lazy(() => import('../../pages/Dashboard/ManageProducts'));
export const ManageOrdersLazy = lazy(() => import('../../pages/Dashboard/ManageOrders'));
export const ManageUsersLazy = lazy(() => import('../../pages/Dashboard/ManageUsers'));
export const ProfileLazy = lazy(() => import('../../pages/Profile/Profile'));
export const ChangePasswordLazy = lazy(() => import('../../pages/Auth/ChangePassword'));
export const ForgotPasswordLazy = lazy(() => import('../../pages/Auth/ForgotPassword'));
export const ResetPasswordLazy = lazy(() => import('../../pages/Auth/ResetPassword'));
