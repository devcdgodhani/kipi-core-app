import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Search, Heart, LogOut, ChevronDown } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../features/hooks';
import { logout } from '../../features/auth/authSlice';
import { authService } from '../../services/auth.service';
import { ROUTES } from '../../routes/routeConfig';
import { useCart } from '../../context/CartContext';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const { openCart, cart } = useCart();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const links = [
        { to: ROUTES.ROOT, label: 'Home' },
        { to: ROUTES.PRODUCTS.ROOT, label: 'Shop' },
        { to: ROUTES.WISHLIST, label: 'Wishlist' },
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

    return (
        <nav className="fixed top-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-sm z-50 transition-all duration-300">
            <div className="h-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                {/* Left: Mobile Menu & Search */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu size={20} />
                    </button>
                    <button className="hidden md:flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
                        <Search size={20} />
                        <span className="text-sm font-medium">Search</span>
                    </button>
                </div>

                {/* Center: Logo */}
                <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <h1 className="text-2xl font-black tracking-[0.2em] uppercase text-primary">KIPI</h1>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2 md:gap-6 flex-1">
                    {/* Desktop Links (Hidden on mobile generally, but here checking if we want them visible or just icons) */}
                    {/* Enterprise usually keeps header clean, links might be in a second row or mega menu. We'll use icons for primary actions */}

                    <button
                        onClick={() => navigate(ROUTES.WISHLIST)}
                        className="hidden md:block p-2 text-gray-600 hover:text-primary transition-colors"
                    >
                        <Heart size={20} />
                    </button>

                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-2 text-gray-600 hover:text-primary transition-colors"
                        >
                            <User size={20} />
                            {user && <span className="hidden lg:block text-xs font-bold uppercase tracking-widest">{user.firstName}</span>}
                        </button>

                        {/* Profile Dropdown */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-4 w-56 bg-white rounded-none shadow-2xl border border-gray-100 py-3 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-5 py-3 border-b border-gray-50 mb-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                                    <p className="text-sm font-bold text-primary truncate">{user?.email}</p>
                                </div>
                                {links.map(link => (
                                    <button
                                        key={link.to}
                                        className="w-full text-left px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors"
                                        onClick={() => { setIsProfileOpen(false); navigate(link.to); }}
                                    >
                                        {link.label}
                                    </button>
                                ))}
                                <div className="h-px bg-gray-100 my-2"></div>
                                <button
                                    className="w-full text-left px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                                    onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                                >
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={openCart}
                        className="p-2 text-gray-600 hover:text-primary transition-colors relative"
                    >
                        <ShoppingBag size={20} />
                        {cart && cart.items.length > 0 && (
                            <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {cart.items.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Sub-navigation (Desktop Only) - For Categories */}
            <div className="hidden md:flex justify-center border-t border-gray-100 py-4 bg-white/50 backdrop-blur-sm">
                <div className="flex gap-8">
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full ${isActive ? 'text-primary after:w-full' : 'text-gray-500 hover:text-primary'}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-left duration-300 md:hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <span className="text-lg font-black uppercase tracking-widest">Menu</span>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-4">
                            {links.map(link => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `block text-2xl font-bold ${isActive ? 'text-primary' : 'text-gray-400'}`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 pt-6">
                            <button
                                onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                                className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-sm"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
