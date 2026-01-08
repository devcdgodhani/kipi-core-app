import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { publicRoutes } from './public/publicRoutes';
import ProtectedRoute from '../components/ProtectedRoute';
import { Suspense } from 'react';
import MainRoutes from './layouts/MainRoutes';
import { HomeLazy, ProductDetailsLazy, ProductListLazy, NotFoundLazy, WishlistLazy, AddressesLazy, CheckoutLazy, OrdersLazy, OrderDetailsLazy, InvoiceLazy, OrderSuccessLazy, CartLazy, ProfileLazy, ChangePasswordLazy, ProfileLayoutLazy, ReturnHistoryLazy, LoyaltyPointsLazy, CheckoutPaymentLazy, PaymentHistoryLazy, RefundHistoryLazy } from './lazy';

import { ROUTES } from './routeConfig';

const router = createBrowserRouter([
    // Main Layout Routes (Mixed access)
    {
        path: ROUTES.ROOT,
        element: <MainRoutes />,
        children: [
            {
                index: true,
                element: <HomeLazy />,
            },
            {
                path: ROUTES.PRODUCTS.ROOT,
                element: <ProductListLazy />,
            },
            {
                path: ROUTES.PRODUCTS.DETAILS,
                element: <ProductDetailsLazy />,
            },
            // Protected Routes
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: ROUTES.CHECKOUT,
                        element: <CheckoutLazy />,
                    },
                    {
                        path: ROUTES.ORDER_SUCCESS,
                        element: <OrderSuccessLazy />,
                    },
                    {
                        path: ROUTES.INVOICE,
                        element: <InvoiceLazy />,
                    },
                    // User Dashboard Section
                    {
                        element: <ProfileLayoutLazy />,
                        children: [
                            {
                                path: ROUTES.PROFILE,
                                element: <ProfileLazy />,
                            },
                            {
                                path: ROUTES.ORDERS,
                                element: <OrdersLazy />,
                            },
                            {
                                path: ROUTES.ORDER_DETAILS,
                                element: <OrderDetailsLazy />,
                            },
                            {
                                path: ROUTES.WISHLIST,
                                element: <WishlistLazy />,
                            },
                            {
                                path: ROUTES.ADDRESSES,
                                element: <AddressesLazy />,
                            },
                            {
                                path: ROUTES.CHANGE_PASSWORD,
                                element: <ChangePasswordLazy />,
                            },
                            {
                                path: ROUTES.RETURNS,
                                element: <ReturnHistoryLazy />,
                            },
                            {
                                path: ROUTES.LOYALTY,
                                element: <LoyaltyPointsLazy />,
                            },
                        ]
                    },
                    // Payment Routes
                    {
                        path: ROUTES.PAYMENT.CHECKOUT,
                        element: <CheckoutPaymentLazy />,
                        errorElement: <div className="p-10 text-red-500">Error loading payment page!</div>,
                    },
                    {
                        path: ROUTES.PAYMENT.HISTORY,
                        element: <PaymentHistoryLazy />,
                    },
                    {
                        path: ROUTES.PAYMENT.REFUNDS,
                        element: <RefundHistoryLazy />,
                    },
                ],
            },
            {
                path: ROUTES.CART,
                element: <CartLazy />,
            },
        ],
    },
    // Public routes
    ...publicRoutes,
    {
        path: '*',
        element: <NotFoundLazy />,
    }
]);

const AppRouter = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RouterProvider router={router} />
        </Suspense>
    );
};

export default AppRouter;
