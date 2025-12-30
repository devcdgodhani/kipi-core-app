import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import Home from '../pages/Home/Home';
import ProductList from '../pages/Products/ProductList';
import ProductDetails from '../pages/Products/ProductDetails';
import Orders from '../pages/Orders/Orders';
import Profile from '../pages/Profile/Profile';
import NotFound from '../pages/NotFound';
import MainLayout from '../layouts/MainLayout';

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="products" element={<ProductList />} />
                    <Route path="products/:id" element={<ProductDetails />} />
                    <Route path="cart" element={<div>Cart</div>} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="profile" element={<Profile />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
