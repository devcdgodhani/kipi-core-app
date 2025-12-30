import { Navigate, type RouteObject } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import DashboardRoutes from '../layouts/DashboardRoutes';
import { DashboardLazy, ManageOrdersLazy, ManageProductsLazy, ManageUsersLazy, ProfileLazy, ChangePasswordLazy, WhatsAppLazy } from '../lazy';
import { ROUTES } from '../routeConfig';

export const privateRoutes: RouteObject = {
    element: <AuthGuard />,
    children: [
        {
            path: ROUTES.ROOT,
            element: <DashboardRoutes />,
            children: [
                {
                    index: true,
                    element: <Navigate to={ROUTES.DASHBOARD.ROOT} replace />,
                },
                {
                    path: ROUTES.DASHBOARD.ROOT,
                    element: <DashboardLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.PRODUCTS,
                    element: <ManageProductsLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.ORDERS,
                    element: <ManageOrdersLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.USERS,
                    element: <ManageUsersLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.WHATSAPP,
                    element: <WhatsAppLazy />,
                },
                {
                    path: ROUTES.PROFILE,
                    element: <ProfileLazy />,
                },
                {
                    path: ROUTES.CHANGE_PASSWORD,
                    element: <ChangePasswordLazy />,
                },
            ],
        },
    ],
};
