import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Search, Heart, LogOut, ChevronDown, Package, MapPin, Settings, Undo2, Coins } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../features/hooks';
import { logout } from '../../features/auth/authSlice';
import { authService } from '../../services/auth.service';
import { ROUTES } from '../../routes/routeConfig';
import { useCart } from '../../context/CartContext';
import { categoryService } from '../../services/product.service';
import type { Category } from '../../types/product.types';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const { openCart, cart } = useCart();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [subcategories, setSubcategories] = useState<{ [key: string]: Category[] }>({});
    const profileRef = useRef<HTMLDivElement>(null);
    const categoryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // User dropdown sections
    const userMenuSections = [
        {
            title: 'Account Settings',
            items: [
                { to: ROUTES.PROFILE, label: 'My Profile', icon: User },
                { to: ROUTES.ADDRESSES, label: 'Addresses', icon: MapPin },
                { to: ROUTES.CHANGE_PASSWORD, label: 'Change Password', icon: Settings },
            ]
        },
        {
            title: 'Shopping',
            items: [
                { to: ROUTES.CART, label: 'My Cart', icon: ShoppingBag },
                { to: ROUTES.ORDERS, label: 'My Orders', icon: Package },
                { to: ROUTES.RETURNS, label: 'Returns', icon: Undo2 },
                { to: ROUTES.WISHLIST, label: 'Wishlist', icon: Heart },
                { to: ROUTES.LOYALTY, label: 'Loyalty Points', icon: Coins },
            ]
        }
    ];

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const allCategories = await categoryService.getAll();
                // Filter parent categories (those without parentId)
                const parentCategories = allCategories.filter(cat => !cat.parentId);
                setCategories(parentCategories);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch subcategories when hovering over a category
    const handleCategoryHover = async (categoryId: string) => {
        if (categoryTimeoutRef.current) {
            clearTimeout(categoryTimeoutRef.current);
        }

        setHoveredCategory(categoryId);

        // If we already have subcategories cached, don't fetch again
        if (subcategories[categoryId]) return;

        try {
            const subs = await categoryService.getSubcategories(categoryId);
            setSubcategories(prev => ({ ...prev, [categoryId]: subs }));
        } catch (error) {
            console.error('Failed to fetch subcategories:', error);
        }
    };

    const handleCategoryLeave = () => {
        categoryTimeoutRef.current = setTimeout(() => {
            setHoveredCategory(null);
        }, 200);
    };

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
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 transition-all duration-300 shadow-sm">
            <div className="h-20 max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <h1 className="text-2xl font-black tracking-[0.2em] uppercase text-primary">KIPI</h1>
                </div>

                {/* Center: Categories (Desktop) */}
                <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
                    {categories.map(category => (
                        <div
                            key={category._id}
                            className="relative group"
                            onMouseEnter={() => handleCategoryHover(category._id)}
                            onMouseLeave={handleCategoryLeave}
                        >
                            <button
                                onClick={() => navigate(`${ROUTES.PRODUCTS.ROOT}?category=${category._id}`)}
                                className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.1em] text-gray-600 hover:text-primary transition-colors py-2"
                            >
                                {category.name}
                                {subcategories[category._id] && subcategories[category._id].length > 0 && (
                                    <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                                )}
                            </button>

                            {/* Subcategories Dropdown */}
                            {hoveredCategory === category._id && subcategories[category._id] && subcategories[category._id].length > 0 && (
                                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-none shadow-2xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200">
                                    {subcategories[category._id].map(subcat => (
                                        <button
                                            key={subcat._id}
                                            onClick={() => {
                                                setHoveredCategory(null);
                                                navigate(`${ROUTES.PRODUCTS.ROOT}?category=${subcat._id}`);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors"
                                        >
                                            {subcat.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2 md:gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu size={20} />
                    </button>

                    {/* Search */}
                    <button className="hidden md:flex items-center gap-2 text-gray-400 hover:text-primary transition-colors p-2">
                        <Search size={20} />
                    </button>

                    {/* Wishlist */}
                    <button
                        onClick={() => navigate(ROUTES.WISHLIST)}
                        className="p-2 text-gray-600 hover:text-primary transition-colors"
                    >
                        <Heart size={20} />
                    </button>

                    {/* Cart */}
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

                    {/* Profile */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-2 text-gray-600 hover:text-primary transition-colors"
                        >
                            <User size={20} />
                            {user && <span className="hidden lg:block text-xs font-bold uppercase tracking-widest">{user.firstName}</span>}
                            <ChevronDown size={14} className={`hidden lg:block transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Profile Dropdown */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-4 w-64 bg-white rounded-none shadow-2xl border border-gray-100 py-3 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-5 py-3 border-b border-gray-50 mb-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                                    <p className="text-sm font-bold text-primary truncate">{user?.email}</p>
                                </div>

                                {userMenuSections.map((section, idx) => (
                                    <div key={idx}>
                                        <div className="px-5 py-2">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{section.title}</p>
                                        </div>
                                        {section.items.map(item => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.to}
                                                    className="w-full text-left px-5 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3"
                                                    onClick={() => { setIsProfileOpen(false); navigate(item.to); }}
                                                >
                                                    <Icon size={16} />
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                        {idx < userMenuSections.length - 1 && <div className="h-px bg-gray-100 my-2"></div>}
                                    </div>
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
                        {/* Categories */}
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categories</p>
                            {categories.map(category => (
                                <div key={category._id}>
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            navigate(`${ROUTES.PRODUCTS.ROOT}?category=${category._id}`);
                                        }}
                                        className="block text-lg font-bold text-gray-600 hover:text-primary"
                                    >
                                        {category.name}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* User Menu Sections */}
                        {userMenuSections.map((section, idx) => (
                            <div key={idx} className="space-y-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{section.title}</p>
                                {section.items.map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.to}
                                            onClick={() => { setIsMenuOpen(false); navigate(item.to); }}
                                            className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-primary"
                                        >
                                            <Icon size={18} />
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}

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
