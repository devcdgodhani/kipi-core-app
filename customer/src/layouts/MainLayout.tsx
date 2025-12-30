import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-20 px-4 md:px-8 pb-8 max-w-7xl mx-auto">
                <Outlet />
            </main>
            <ThemeSwitcher />
        </div>
    );
};

export default MainLayout;
