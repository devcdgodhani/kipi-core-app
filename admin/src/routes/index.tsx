import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { publicRoutes } from './public/publicRoutes';
import { privateRoutes } from './private/privateRoutes';
import { Suspense } from 'react';

const router = createBrowserRouter([
    publicRoutes,
    privateRoutes,
    {
        path: '*',
        element: <div>Not Found</div>,
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
