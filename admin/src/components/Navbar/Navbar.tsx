import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogOut, ChevronDown } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../features/hooks';
import { logout } from '../../features/auth/authSlice';
import { authService } from '../../services/auth.service';

const Navbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

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

    const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'A';
    const userName = user?.firstName || 'Admin';

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-[60] flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md md:hidden"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center font-bold text-sm text-primary">K</div>
                    <span className="font-bold tracking-widest text-xs uppercase text-primary hidden md:block">Kipi Admin</span>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        className="flex items-center gap-2 focus:outline-none bg-gray-50 hover:bg-gray-100 rounded-full pr-3 pl-1 py-1 transition-colors"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <span className="text-xs font-bold">{userInitial}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 hidden sm:block">{userName}</span>
                        <ChevronDown size={14} className={`text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 mb-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Signed in as</p>
                                <p className="text-sm font-bold text-gray-800 truncate">{user?.email || userName}</p>
                                <p className="text-xs text-primary font-medium mt-0.5 capitalize">{user?.type?.replace('_', ' ') || 'Admin'}</p>
                            </div>

                            <button
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary flex items-center gap-3 transition-colors"
                                onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                            >
                                <User size={16} /> Profile
                            </button>

                            <button
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary flex items-center gap-3 transition-colors"
                                onClick={() => { setIsProfileOpen(false); navigate('/change-password'); }}
                            >
                                <Lock size={16} /> Change Password
                            </button>

                            <div className="h-px bg-gray-100 my-1"></div>

                            <button
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
