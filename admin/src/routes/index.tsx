import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { publicRoutes } from './public/publicRoutes';
import { privateRoutes } from './private/privateRoutes';
import { Suspense, lazy } from 'react';

const NotFoundLazy = lazy(() => import('../pages/NotFound'));

const router = createBrowserRouter([
    publicRoutes,
    privateRoutes,
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
