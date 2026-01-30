import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer/Footer';
import { Toaster } from 'react-hot-toast';

const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-background">
            <Toaster position="top-right" />
            <Navbar />
            <main className="pt-20 px-4 md:px-8 pb-16 max-w-7xl mx-auto w-full flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
