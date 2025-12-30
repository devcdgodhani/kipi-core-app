import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import Dashboard from '../pages/Dashboard/Index';
import ManageProducts from '../pages/Dashboard/ManageProducts';
import ManageOrders from '../pages/Dashboard/ManageOrders';
import ManageUsers from '../pages/Dashboard/ManageUsers';
import MainLayout from '../layouts/MainLayout';

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="products" element={<ManageProducts />} />
                    <Route path="orders" element={<ManageOrders />} />
                    <Route path="users" element={<ManageUsers />} />
                </Route>

                <Route path="*" element={<div>Not Found</div>} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
