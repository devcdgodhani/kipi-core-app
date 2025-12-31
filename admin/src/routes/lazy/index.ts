import { lazy } from 'react';

export const LoginLazy = lazy(() => import('../../pages/Auth/Login'));
export const RegisterLazy = lazy(() => import('../../pages/Auth/Register'));
export const VerifyOTPLazy = lazy(() => import('../../pages/Auth/VerifyOTP'));
export const DashboardLazy = lazy(() => import('../../pages/Dashboard/Index'));
export const ManageProductsLazy = lazy(() => import('../../pages/Dashboard/ManageProducts'));
export const ManageOrdersLazy = lazy(() => import('../../pages/Dashboard/ManageOrders'));
export const ManageUsersLazy = lazy(() => import('../../pages/User/UserList'));
export const ProfileLazy = lazy(() => import('../../pages/Profile/Profile'));
export const ChangePasswordLazy = lazy(() => import('../../pages/Auth/ChangePassword'));
export const WhatsAppLazy = lazy(() => import('../../pages/WhatsApp/WhatsAppList'));
export const ManageLotsLazy = lazy(() => import('../../pages/Lot/LotList'));
export const ManageLotFormLazy = lazy(() => import('../../pages/Lot/LotForm'));
export const ManageCategoriesLazy = lazy(() => import('../../pages/Category/CategoryList'));
export const ManageCategoryFormLazy = lazy(() => import('../../pages/Category/CategoryForm'));
export const ManageUserFormLazy = lazy(() => import('../../pages/User/UserForm'));
export const ForgotPasswordLazy = lazy(() => import('../../pages/Auth/ForgotPassword'));
export const ResetPasswordLazy = lazy(() => import('../../pages/Auth/ResetPassword'));
