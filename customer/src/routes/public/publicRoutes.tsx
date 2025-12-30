import { type RouteObject } from 'react-router-dom';
import PublicGuard from './PublicGuard';
import { LoginLazy } from '../lazy';
import { ROUTES } from '../routeConfig';

export const publicRoutes: RouteObject[] = [
    // Guest only routes (Redirect if logged in)
    {
        element: <PublicGuard />,
        children: [
            {
                path: ROUTES.LOGIN,
                element: <LoginLazy />,
            },
        ],
    },
];
