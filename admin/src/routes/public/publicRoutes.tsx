import { type RouteObject } from 'react-router-dom';
import PublicGuard from './PublicGuard';
import { LoginLazy } from '../lazy';
import { ROUTES } from '../routeConfig';

export const publicRoutes: RouteObject = {
    element: <PublicGuard />,
    children: [
        {
            path: ROUTES.LOGIN,
            element: <LoginLazy />,
        },
    ],
};
