import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { Toaster } from 'react-hot-toast';

const MainLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="pt-20 px-4 md:px-8 pb-8 md:ml-64 transition-all duration-300">
                <Outlet />
            </main>
            <ThemeSwitcher />
            <Toaster position="top-right" reverseOrder={false} />
        </div>
    );
};

export default MainLayout;
