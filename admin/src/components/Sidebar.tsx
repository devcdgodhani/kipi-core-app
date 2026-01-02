import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Package, ShoppingCart, Users, X, Layers, Tags, Sliders, Box, HardDrive, Star, Ticket, CornerUpLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { currentTheme } = useTheme();

    const links = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/whatsapp', label: 'WhatsApp', icon: MessageSquare },
        { to: '/products', label: 'Products', icon: Package },
        { to: '/skus', label: 'SKUs', icon: Box },
        { to: '/categories', label: 'Categories', icon: Tags },
        { to: '/attributes', label: 'Attributes', icon: Sliders },
        { to: '/lots', label: 'Lots', icon: Layers },
        { to: '/file-manager', label: 'File Manager', icon: HardDrive },
        { to: '/orders', label: 'Orders', icon: ShoppingCart },
        { to: '/returns', label: 'Returns', icon: CornerUpLeft },
        { to: '/reviews', label: 'Reviews', icon: Star },
        { to: '/coupons', label: 'Coupons', icon: Ticket },
        { to: '/users', label: 'Users', icon: Users },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } pt-16`}
            >
                <div className="flex items-center justify-between p-4 md:hidden absolute top-0 left-0 right-0 h-16 border-b border-gray-100">
                    <span className="font-bold tracking-widest text-xs uppercase text-primary">Kipi Admin</span>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-2 mt-4 md:mt-0">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => {
                                if (window.innerWidth < 768) onClose();
                            }}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${isActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                            style={({ isActive }) =>
                                isActive ? { color: currentTheme.colors.primary, backgroundColor: `${currentTheme.colors.primary}15` } : {}
                            }
                        >
                            <link.icon size={20} />
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};
