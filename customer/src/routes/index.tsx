import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { publicRoutes } from './public/publicRoutes';
import { privateRoutes } from './private/privateRoutes';
import { Suspense } from 'react';
import MainRoutes from './layouts/MainRoutes';
import { HomeLazy, ProductDetailsLazy, ProductListLazy, NotFoundLazy } from './lazy';
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
            {
                path: ROUTES.CART,
                element: <div>Cart</div>,
            },
            // Private routes injected here to share layout
            privateRoutes,
        ],
    },
    // Public routes (Guest only, outside main layout if needed, or separate)
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
