import { Navigate, type RouteObject } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import DashboardRoutes from '../layouts/DashboardRoutes';
import { DashboardLazy, ManageOrdersLazy, ManageProductsLazy, ManageProductFormLazy, ManageSkusLazy, ManageSkuFormLazy, ManageUsersLazy, ProfileLazy, ChangePasswordLazy, WhatsAppLazy, ManageLotsLazy, ManageCategoriesLazy, ManageLotFormLazy, ManageCategoryFormLazy, ManageUserFormLazy, ManageAttributesLazy, ManageAttributeFormLazy, FileManagerLazy, ManageReviewsLazy, ManageCouponsLazy, ManageCouponFormLazy } from '../lazy';

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
                    path: ROUTES.DASHBOARD.PRODUCTS_CREATE,
                    element: <ManageProductFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.PRODUCTS_EDIT,
                    element: <ManageProductFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.SKUS,
                    element: <ManageSkusLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.SKUS_CREATE,
                    element: <ManageSkuFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.SKUS_EDIT,
                    element: <ManageSkuFormLazy />,
                },

                {
                    path: ROUTES.DASHBOARD.ORDERS,
                    element: <ManageOrdersLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.REVIEWS,
                    element: <ManageReviewsLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.COUPONS,
                    element: <ManageCouponsLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.COUPONS_CREATE,
                    element: <ManageCouponFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.COUPONS_EDIT,
                    element: <ManageCouponFormLazy />,
                },

                {
                    path: ROUTES.DASHBOARD.USERS,
                    element: <ManageUsersLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.USERS_CREATE,
                    element: <ManageUserFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.USERS_EDIT, // routeConfig handles :id
                    element: <ManageUserFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.WHATSAPP,
                    element: <WhatsAppLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.LOTS,
                    element: <ManageLotsLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.LOTS_CREATE,
                    element: <ManageLotFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.LOTS_EDIT,
                    element: <ManageLotFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.CATEGORIES,
                    element: <ManageCategoriesLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.CATEGORIES_CREATE,
                    element: <ManageCategoryFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.CATEGORIES_EDIT,
                    element: <ManageCategoryFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.ATTRIBUTES,
                    element: <ManageAttributesLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.ATTRIBUTES_CREATE,
                    element: <ManageAttributeFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.ATTRIBUTES_EDIT,
                    element: <ManageAttributeFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.FILE_MANAGER,
                    element: <FileManagerLazy />,
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
