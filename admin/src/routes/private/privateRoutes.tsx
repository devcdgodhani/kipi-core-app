import { Navigate, type RouteObject } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import DashboardRoutes from '../layouts/DashboardRoutes';
import { DashboardLazy, ManageOrdersLazy, ManageOrderDetailsLazy, ManageProductsLazy, ManageProductFormLazy, ManageSkusLazy, ManageSkuFormLazy, ManageUsersLazy, ProfileLazy, ChangePasswordLazy, WhatsAppLazy, ManageLotsLazy, ManageCategoriesLazy, ManageLotFormLazy, ManageCategoryFormLazy, ManageUserFormLazy, ManageAttributesLazy, ManageAttributeFormLazy, FileManagerLazy, ManageReviewsLazy, ManageReturnsLazy, ManageReturnDetailsLazy, ManageCouponsLazy, ManageCouponFormLazy, ManageStockLedgerLazy, ManageLoyaltyLazy, SalesAnalyticsLazy, ProductInsightsLazy, CustomerInsightsLazy, FinancialReportsLazy, LotAnalyticsLazy, LogisticsAnalyticsLazy, CourierAnalyticsLazy, ShipmentListLazy, ShipmentDetailsLazy, RtoDashboardLazy, CourierConfigLazy, WarehouseListLazy, WarehouseFormLazy, NdrDashboardLazy, CronJobHubLazy, PaymentGatewayListLazy, GatewayConfigFormLazy, WebhookLogListLazy } from '../lazy';

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
                    path: ROUTES.DASHBOARD.ORDERS_DETAILS,
                    element: <ManageOrderDetailsLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.REVIEWS,
                    element: <ManageReviewsLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.RETURNS,
                    element: <ManageReturnsLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.RETURNS_DETAILS,
                    element: <ManageReturnDetailsLazy />,
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
                    path: ROUTES.DASHBOARD.STOCK_LEDGER,
                    element: <ManageStockLedgerLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.LOYALTY,
                    element: <ManageLoyaltyLazy />,
                },
                // Logistics
                {
                    path: ROUTES.DASHBOARD.SHIPMENTS,
                    element: <ShipmentListLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.SHIPMENT_DETAILS,
                    element: <ShipmentDetailsLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.RTO_DASHBOARD,
                    element: <RtoDashboardLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.COURIER_CONFIG,
                    element: <CourierConfigLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.NDR_DASHBOARD,
                    element: <NdrDashboardLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.CRON_HUB,
                    element: <CronJobHubLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.WAREHOUSES,
                    element: <WarehouseListLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.WAREHOUSES_CREATE,
                    element: <WarehouseFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.WAREHOUSES_EDIT,
                    element: <WarehouseFormLazy />,
                },

                // Intelligence Section
                {
                    path: ROUTES.DASHBOARD.ANALYTICS_SALES,
                    element: <SalesAnalyticsLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.ANALYTICS_PRODUCTS,
                    element: <ProductInsightsLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.ANALYTICS_CUSTOMERS,
                    element: <CustomerInsightsLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.ANALYTICS_FINANCIAL,
                    element: <FinancialReportsLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.ANALYTICS_LOTS,
                    element: <LotAnalyticsLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.ANALYTICS_LOGISTICS,
                    element: <LogisticsAnalyticsLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.ANALYTICS_COURIERS,
                    element: <CourierAnalyticsLazy />,
                },

                // Payment Management
                {
                    path: ROUTES.DASHBOARD.PAYMENT_GATEWAYS,
                    element: <PaymentGatewayListLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.PAYMENT_GATEWAY_CREATE,
                    element: <GatewayConfigFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.PAYMENT_GATEWAY_EDIT,
                    element: <GatewayConfigFormLazy />,
                },
                {
                    path: ROUTES.DASHBOARD.WEBHOOK_LOGS,
                    element: <WebhookLogListLazy />,
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
