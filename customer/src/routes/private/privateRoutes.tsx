import { type RouteObject } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import { OrdersLazy, ProfileLazy } from '../lazy';
import { ROUTES } from '../routeConfig';

export const privateRoutes: RouteObject = {
    element: <AuthGuard />,
    children: [
        {
            path: ROUTES.ORDERS,
            element: <OrdersLazy />,
        },
        {
            path: ROUTES.PROFILE,
            element: <ProfileLazy />,
        },
    ],
};
