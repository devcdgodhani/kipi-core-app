import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageSquare,
    Package,
    ShoppingCart,
    Users,
    X,
    Layers,
    Tags,
    Sliders,
    Box,
    HardDrive,
    Star,
    Ticket,
    CornerUpLeft,
    Activity,
    Coins,
    BarChart3,
    DollarSign,
    Receipt,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SidebarSection {
    title: string;
    icon: any;
    items: { to: string; label: string; icon: any }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { currentTheme } = useTheme();
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    // Load expanded sections from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-expanded');
        if (saved) {
            setExpandedSections(JSON.parse(saved));
        } else {
            // Default: expand all sections
            setExpandedSections(['Dashboard', 'Catalog', 'Operations', 'Intelligence', 'Engagement', 'Settings']);
        }
    }, []);

    // Save expanded sections to localStorage
    const toggleSection = (title: string) => {
        const newExpanded = expandedSections.includes(title)
            ? expandedSections.filter(s => s !== title)
            : [...expandedSections, title];
        setExpandedSections(newExpanded);
        localStorage.setItem('sidebar-expanded', JSON.stringify(newExpanded));
    };

    const sidebarSections: SidebarSection[] = [
        {
            title: 'Dashboard',
            icon: LayoutDashboard,
            items: [
                { to: '/dashboard', label: 'Overview', icon: LayoutDashboard }
            ]
        },
        {
            title: 'Catalog',
            icon: Package,
            items: [
                { to: '/products', label: 'Products', icon: Package },
                { to: '/skus', label: 'SKUs', icon: Box },
                { to: '/categories', label: 'Categories', icon: Tags },
                { to: '/attributes', label: 'Attributes', icon: Sliders },
                { to: '/lots', label: 'Lots', icon: Layers }
            ]
        },
        {
            title: 'Operations',
            icon: ShoppingCart,
            items: [
                { to: '/orders', label: 'Orders', icon: ShoppingCart },
                { to: '/returns', label: 'Returns', icon: CornerUpLeft },
                { to: '/inventory-audit', label: 'Stock Ledger', icon: Activity },
                { to: '/file-manager', label: 'File Manager', icon: HardDrive }
            ]
        },
        {
            title: 'Intelligence',
            icon: BarChart3,
            items: [
                { to: '/intelligence/sales', label: 'Sales Analytics', icon: DollarSign },
                { to: '/intelligence/products', label: 'Product Insights', icon: Package },
                { to: '/intelligence/customers', label: 'Customer Insights', icon: Users },
                { to: '/intelligence/financial', label: 'Financial Reports', icon: Receipt }
            ]
        },
        {
            title: 'Engagement',
            icon: MessageSquare,
            items: [
                { to: '/reviews', label: 'Reviews', icon: Star },
                { to: '/coupons', label: 'Coupons', icon: Ticket },
                { to: '/loyalty', label: 'Rewards Hub', icon: Coins },
                { to: '/whatsapp', label: 'WhatsApp', icon: MessageSquare }
            ]
        },
        {
            title: 'Settings',
            icon: Users,
            items: [
                { to: '/users', label: 'Users', icon: Users }
            ]
        }
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
                    } pt-16 overflow-y-auto`}
            >
                <div className="flex items-center justify-between p-4 md:hidden absolute top-0 left-0 right-0 h-16 border-b border-gray-100 bg-white z-10">
                    <span className="font-bold tracking-widest text-xs uppercase text-primary">Kipi Admin</span>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-2 mt-4 md:mt-0">
                    {sidebarSections.map((section) => {
                        const isExpanded = expandedSections.includes(section.title);
                        const SectionIcon = section.icon;

                        return (
                            <div key={section.title} className="space-y-1">
                                {/* Section Header */}
                                <button
                                    onClick={() => toggleSection(section.title)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <SectionIcon size={14} />
                                        <span>{section.title}</span>
                                    </div>
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>

                                {/* Section Items */}
                                {isExpanded && (
                                    <div className="space-y-1 pl-2">
                                        {section.items.map((item) => {
                                            const ItemIcon = item.icon;
                                            return (
                                                <NavLink
                                                    key={item.to}
                                                    to={item.to}
                                                    onClick={() => {
                                                        if (window.innerWidth < 768) onClose();
                                                    }}
                                                    className={({ isActive }) =>
                                                        `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${isActive
                                                            ? 'bg-primary/10 text-primary font-bold'
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                                                        }`
                                                    }
                                                    style={({ isActive }) =>
                                                        isActive ? { color: currentTheme.colors.primary, backgroundColor: `${currentTheme.colors.primary}15` } : {}
                                                    }
                                                >
                                                    <ItemIcon size={18} />
                                                    <span>{item.label}</span>
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};
