import { type RouteObject } from 'react-router-dom';
import PublicGuard from './PublicGuard';
import { LoginLazy, RegisterLazy, VerifyOTPLazy, ForgotPasswordLazy, ResetPasswordLazy } from '../lazy';
import { ROUTES } from '../routeConfig';

export const publicRoutes: RouteObject = {
    element: <PublicGuard />,
    children: [
        {
            path: ROUTES.LOGIN,
            element: <LoginLazy />,
        },
        {
            path: ROUTES.REGISTER,
            element: <RegisterLazy />,
        },
        {
            path: ROUTES.VERIFY_OTP,
            element: <VerifyOTPLazy />,
        },
        {
            path: ROUTES.FORGOT_PASSWORD,
            element: <ForgotPasswordLazy />,
        },
        {
            path: ROUTES.RESET_PASSWORD,
            element: <ResetPasswordLazy />,
        },
    ],
};
