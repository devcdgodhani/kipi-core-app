import React, { useEffect } from 'react';
import { X, Filter } from 'lucide-react';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, subtitle, children, footer }) => {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            {/* Drawer */}
            <div className={`fixed top-0 left-0 h-full w-full sm:max-w-xl md:max-w-2xl bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                {/* Header */}
                <div className="bg-primary text-white px-8 py-6 flex flex-col justify-center relative shadow-lg z-10">
                    <div className="flex items-center gap-4 mb-1">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/10">
                            <Filter size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-wider text-white">{title}</h2>
                            {subtitle && <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1">{subtitle}</p>}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] z-10">
                        {footer}
                    </div>
                )}
            </div>
        </>
    );
};
