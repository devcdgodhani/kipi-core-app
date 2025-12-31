import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Lock, LogOut, ChevronDown } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../features/hooks';
import { logout } from '../../features/auth/authSlice';
import { authService } from '../../services/auth.service';
import { ROUTES } from '../../routes/routeConfig';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const links = [
        { to: ROUTES.ROOT, label: 'Home' },
        { to: ROUTES.PRODUCTS.ROOT, label: 'Products' },
        { to: ROUTES.ORDERS, label: 'Orders' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            dispatch(logout());
            navigate('/login');
        }
    };

    const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';
    const userName = user?.firstName || 'User';

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 px-4 md:px-8">
            <div className="h-full max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center font-bold text-sm text-primary">K</div>
                    <span className="font-bold tracking-widest text-xs uppercase text-primary">Kipi</span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex gap-8 items-center">
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `text-sm font-semibold transition-colors duration-200 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                {/* Right Actions & Mobile Toggle */}
                <div className="flex items-center gap-4">
                    <button className="text-gray-600 hover:text-primary transition-colors">
                        <ShoppingCart size={20} />
                    </button>

                    {/* Desktop Profile Dropdown */}
                    <div className="hidden md:block relative" ref={profileRef}>
                        <button
                            className="flex items-center gap-2 focus:outline-none"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <span className="text-xs font-bold">{userInitial}</span>
                            </div>
                            <ChevronDown size={14} className={`text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                                <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50">
                                    <p className="text-xs font-medium text-gray-500">Signed in as</p>
                                    <p className="text-sm font-bold text-gray-800 truncate">{user?.email || userName}</p>
                                </div>

                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary flex items-center gap-2 transition-colors"
                                    onClick={() => { setIsProfileOpen(false); navigate(ROUTES.PROFILE); }}
                                >
                                    <User size={16} /> Profile
                                </button>

                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary flex items-center gap-2 transition-colors"
                                    onClick={() => { setIsProfileOpen(false); navigate(ROUTES.ORDERS); }}
                                >
                                    <ShoppingCart size={16} /> My Orders
                                </button>

                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary flex items-center gap-2 transition-colors"
                                    onClick={() => { setIsProfileOpen(false); navigate(ROUTES.CHANGE_PASSWORD); }}
                                >
                                    <Lock size={16} /> Change Password
                                </button>

                                <div className="h-px bg-gray-100 my-1"></div>

                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                    onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        className="md:hidden text-gray-600 hover:text-primary"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4 md:hidden flex flex-col gap-2 shadow-lg animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="text-xs font-bold">{userInitial}</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">{userName}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{user?.email}</p>
                        </div>
                    </div>

                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) =>
                                `text-sm font-semibold p-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary/5 text-primary' : 'text-gray-500 hover:bg-gray-50'}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    <div className="h-px bg-gray-100 my-2"></div>

                    <button
                        className="text-left w-full p-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-lg flex items-center gap-3"
                        onClick={() => { setIsMenuOpen(false); navigate(ROUTES.PROFILE); }}
                    >
                        <User size={18} /> Profile
                    </button>
                    <button
                        className="text-left w-full p-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-lg flex items-center gap-3"
                        onClick={() => { setIsMenuOpen(false); navigate(ROUTES.ORDERS); }}
                    >
                        <ShoppingCart size={18} /> My Orders
                    </button>
                    <button
                        className="text-left w-full p-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-lg flex items-center gap-3"
                        onClick={() => { setIsMenuOpen(false); navigate(ROUTES.CHANGE_PASSWORD); }}
                    >
                        <Lock size={18} /> Change Password
                    </button>
                    <button
                        className="text-left w-full p-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-3"
                        onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
