import React from 'react';
import MainLayout from '../../layouts/MainLayout';

import { CheckoutProvider } from '../../context/CheckoutContext';

const MainRoutes: React.FC = () => {
    return (
        <CheckoutProvider>
            <MainLayout />
        </CheckoutProvider>
    );
};

export default MainRoutes;
