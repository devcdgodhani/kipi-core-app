import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    Package,
    Heart,
    MapPin,
    Settings,
    LogOut,
    ChevronRight,
    LayoutDashboard,
    Undo2,
    Coins,
    ShoppingBag,
    Wallet
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../features/hooks';
import { logout } from '../../features/auth/authSlice';
import { ROUTES } from '../../routes/routeConfig';
import { toast } from 'react-hot-toast';

const ProfileLayout: React.FC = () => {
    const { user } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate(ROUTES.ROOT);
    };

    const navSections = [
        {
            title: 'Account Settings',
            items: [
                { label: 'Overview', icon: LayoutDashboard, path: ROUTES.PROFILE },
                { label: 'My Addresses', icon: MapPin, path: ROUTES.ADDRESSES },
                { label: 'Change Password', icon: Settings, path: ROUTES.CHANGE_PASSWORD },
            ]
        },
        {
            title: 'Shopping',
            items: [
                { label: 'My Cart', icon: ShoppingBag, path: ROUTES.CART },
                { label: 'My Orders', icon: Package, path: ROUTES.ORDERS },
                { label: 'My Returns', icon: Undo2, path: ROUTES.RETURNS },
                { label: 'Wishlist', icon: Heart, path: ROUTES.WISHLIST },
                { label: 'My Wallet', icon: Wallet, path: ROUTES.WALLET },
            ]
        }
    ];

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50/50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                            {/* User Header */}
                            <div className="p-8 bg-gray-900 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/30 transition-all duration-500" />
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black mb-4">
                                        {user.firstName?.charAt(0).toUpperCase()}
                                    </div>
                                    <h2 className="text-xl font-black tracking-tight">{user.firstName} {user.lastName}</h2>
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">{user.email}</p>
                                </div>
                            </div>

                            {/* Nav Links */}
                            <nav className="p-4 space-y-8">
                                {navSections.map((section) => (
                                    <div key={section.title}>
                                        <h3 className="px-6 mb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{section.title}</h3>
                                        <ul className="space-y-1">
                                            {section.items.map((item) => (
                                                <li key={item.path}>
                                                    <NavLink
                                                        to={item.path}
                                                        end={item.path === ROUTES.PROFILE}
                                                        className={({ isActive }) => `
                                                            flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300 group
                                                            ${isActive
                                                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                                                        `}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <item.icon size={18} className="transition-colors duration-300" />
                                                            <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                                                        </div>
                                                        {item.path === ROUTES.PROFILE && (
                                                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                        )}
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}

                                <div className="mt-8 pt-8 border-t border-gray-100 px-4">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all duration-300 font-black uppercase tracking-widest group"
                                    >
                                        <LogOut size={20} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 min-h-[600px] relative overflow-hidden">
                            <div className="relative z-10">
                                <Outlet />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout;
