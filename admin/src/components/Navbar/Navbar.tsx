import React from 'react';

const Navbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
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
                    <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center font-bold text-sm text-primary">N</div>
                    <span className="font-bold tracking-widest text-xs uppercase text-primary hidden md:block">Niken Admin</span>
                </div>
            </div>
            <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="text-xs font-bold">A</span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
