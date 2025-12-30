import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, ShoppingCart, User } from 'lucide-react';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const links = [
        { to: '/', label: 'Home' },
        { to: '/products', label: 'Products' },
        { to: '/orders', label: 'Orders' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 px-4 md:px-8">
            <div className="h-full max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center font-bold text-sm text-primary">N</div>
                    <span className="font-bold tracking-widest text-xs uppercase text-primary">Niken</span>
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

                    <div className="hidden md:flex w-8 h-8 rounded-full bg-primary/10 items-center justify-center text-primary">
                        <span className="text-xs font-bold">A</span>
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
                <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4 md:hidden flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-2">
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) =>
                                `text-sm font-semibold py-2 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-gray-500'}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                    <div className="border-t pt-4 mt-2 flex items-center gap-3 text-sm font-semibold text-gray-500">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="text-xs font-bold">A</span>
                        </div>
                        <span>My Profile</span>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
