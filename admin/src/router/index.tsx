import { Routes, Route, Navigate } from 'react-router';
import AuthLayout from '../layout/AuthLayout';
import MainLayout from '../layout/MainLayout';
import PrivateRoute from './guards/PrivateRoute';
import PublicRoute from './guards/PublicRoute';
// Public Pages (Authentication)
import Login from '../pages/public/auth/Login';
import Signup from '../pages/public/auth/Signup';
import OtpVerification from '../pages/public/auth/OtpVerification';

// Admin Pages (Protected)
import Dashboard from '../pages/admin/dashboard/Dashboard';
import UserManagement from '../pages/admin/user/UserManagement';
import AccountSettings from '../pages/admin/settings/AccountSettings';
import AttributeList from '../pages/admin/settings/attributes/AttributeList';
import CategoryList from '../pages/admin/settings/categories/CategoryList';
import ProductList from '../pages/admin/products/ProductList';
import ProductForm from '../pages/admin/products/ProductForm';

// New Pages
import LotList from '../pages/admin/inventory/LotList';
import LotForm from '../pages/admin/inventory/LotForm';
import PaymentConfigList from '../pages/admin/settings/PaymentConfigList';
import PaymentConfigForm from '../pages/admin/settings/PaymentConfigForm';
import CouponList from '../pages/admin/offers/CouponList';
import CouponForm from '../pages/admin/offers/CouponForm';

const AppRouter = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/verify-otp" element={<OtpVerification />} />
                </Route>
            </Route>

            {/* Private Routes */}
            <Route element={<PrivateRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/create" element={<ProductForm />} />
                    <Route path="/products/:id" element={<ProductForm />} />
                    <Route path="/profile" element={<AccountSettings />} />
                    <Route path="/attributes" element={<AttributeList />} />
                    <Route path="/categories" element={<CategoryList />} />

                    {/* Inventory Module */}
                    <Route path="/inventory/lots" element={<LotList />} />
                    <Route path="/inventory/lots" element={<LotList />} />
                    <Route path="/inventory/lots/create" element={<LotForm />} />
                    <Route path="/inventory/lots/:id" element={<LotForm />} />


                    {/* Settings Module */}
                    <Route path="/settings/payment-config" element={<PaymentConfigList />} />
                    <Route path="/settings/payment-config/:entityType/:entityId" element={<PaymentConfigForm />} />

                    {/* Offers Module */}
                    <Route path="/offers/coupons" element={<CouponList />} />
                    <Route path="/offers/coupons/create" element={<CouponForm />} />
                    <Route path="/offers/coupons/:id" element={<CouponForm />} />
                </Route>
            </Route>

            {/* Redirection */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<div className="text-white text-center h-screen flex items-center justify-center text-4xl font-black bg-slate-950">404 | Node Not Found</div>} />
        </Routes>
    );
};

export default AppRouter;
