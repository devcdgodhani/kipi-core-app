import { lazy } from 'react';

export const LoginLazy = lazy(() => import('../../pages/Auth/Login'));
export const DashboardLazy = lazy(() => import('../../pages/Dashboard/Index'));
export const ManageProductsLazy = lazy(() => import('../../pages/Dashboard/ManageProducts'));
export const ManageOrdersLazy = lazy(() => import('../../pages/Dashboard/ManageOrders'));
export const ManageUsersLazy = lazy(() => import('../../pages/Dashboard/ManageUsers'));
