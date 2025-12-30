import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    ChevronRight,
    SearchCode,
    ShoppingBag,
    FolderTree,
    Tags,
    Sun,
    Moon
} from 'lucide-react';
import { authService } from '../api/services/auth.service';
import { logout } from '../Redux/slices/authSlice';
import { toggleTheme } from '../Redux/slices/themeSlice';
import type { RootState } from '../Redux/store';

const MainLayout = () => {
    // Default to closed on mobile, open will be handled via CSS for desktop or explicit toggle
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const theme = useSelector((state: RootState) => state.theme?.mode || 'light');

    // Handle Theme Class on Body/HTML
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Close sidebar on route change (for mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    // Simple, consistent color scheme for icons (Brand accent)
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'User Matrix', path: '/users' },
        { icon: ShoppingBag, label: 'Products', path: '/products' },
        { icon: FolderTree, label: 'Categories', path: '/categories' },
        { icon: Tags, label: 'Attributes', path: '/attributes' },
        { icon: SearchCode, label: 'Lot Management', path: '/inventory/lots' },
        { icon: Tags, label: 'Offers & Coupons', path: '/offers/coupons' },
        { icon: Settings, label: 'Settings', path: '/settings/payment-config' },
    ];

    const handleLogout = async () => {
        try {
            await authService.logout();
            dispatch(logout());
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
            dispatch(logout());
            window.location.href = '/login';
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans flex overflow-hidden transition-colors duration-300">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-surface/50 lg:bg-surface/30 backdrop-blur-3xl border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col p-6">
                    {/* Brand */}
                    <div className="flex items-center gap-4 px-2 mb-10">
                        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 rotate-3 transition-transform hover:rotate-6">
                            <span className="text-white text-xl font-black italic">K</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-black text-text-primary leading-tight tracking-tight uppercase italic">
                                KipiCore<span className="text-brand-500">Nexus</span>
                            </h1>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary">Admin Control</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center justify-between group px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-sm'
                                        : 'hover:bg-surface-hover text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-500' : 'group-hover:text-text-primary text-text-secondary'}`} />
                                        <span className={`text-sm font-bold tracking-tight`}>{item.label}</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0 text-brand-500' : 'opacity-0 -translate-x-2'}`} />
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-20 bg-surface/30 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
                    <div className="flex items-center gap-4 lg:gap-6 flex-1">
                        <button
                            className="lg:hidden p-2 text-text-secondary hover:text-text-primary focus:outline-none transition-colors"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <div className="hidden md:flex items-center flex-1 max-w-md relative group">
                            <Search className="absolute left-4 w-4 h-4 text-text-secondary group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search system nodes..."
                                className="w-full bg-surface/50 border border-border rounded-xl py-2.5 pl-12 pr-4 text-xs font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500/20 transition-all placeholder:text-text-secondary"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-5">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="p-2.5 bg-surface/50 border border-border rounded-xl text-text-secondary hover:text-brand-500 hover:border-brand-500/30 transition-all hover:shadow-lg hover:shadow-brand-500/10 cursor-pointer"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <button className="relative p-2.5 bg-surface/50 border border-border rounded-xl text-text-secondary hover:text-text-primary transition-all hover:bg-surface-hover">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-surface" />
                        </button>

                        <div className="h-8 w-px bg-border mx-1" />

                        {/* User Profile Dropdown */}
                        <div className="relative group/profile">
                            <div className="flex items-center gap-3 lg:gap-4 pl-2 cursor-pointer">
                                <div className="flex flex-col items-end hidden sm:flex">
                                    <span className="text-sm font-black text-text-primary tracking-tight">{user?.firstName} {user?.lastName}</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-500">{user?.type}</span>
                                </div>
                                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-600 p-0.5 shadow-lg shadow-brand-500/20 group-hover/profile:scale-105 transition-transform">
                                    <div className="w-full h-full rounded-[10px] bg-surface flex items-center justify-center font-black text-text-primary text-lg overflow-hidden border border-border">
                                        {(user?.firstName || 'A').charAt(0)}
                                    </div>
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-4 w-60 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-2 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-200 translate-y-2 group-hover/profile:translate-y-0 z-50">
                                <div className="px-4 py-3 border-b border-border mb-2">
                                    <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Account</p>
                                </div>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors group/item"
                                >
                                    <Settings className="w-4 h-4 text-brand-500 group-hover/item:text-brand-400" />
                                    <span className="text-sm font-bold">Profile</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-red-400 hover:bg-red-500/5 transition-colors group/item mt-1"
                                >
                                    <LogOut className="w-4 h-4 text-text-secondary group-hover/item:text-red-400" />
                                    <span className="text-sm font-bold">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Overlay/Gradients - Simplified for "Clean" look */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative z-10 scrollbar-hide">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
export default MainLayout;
