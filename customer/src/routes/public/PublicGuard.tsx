import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../routeConfig';

// GuestGuard: Only for users who are NOT logged in (e.g. Login page)
const PublicGuard: React.FC = () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to={ROUTES.ROOT} replace />;
    }

    return <Outlet />;
};

export default PublicGuard;
