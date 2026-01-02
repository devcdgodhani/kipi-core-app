import React, { useEffect, useState, useCallback } from 'react';
import { Table, type Column } from '../../components/common/Table';
import { orderService } from '../../services/order.service';
import type { Order } from '../../types/order.types';
import {
    Search,
    RotateCcw,
    CreditCard,
    Banknote,
    Ticket,
    Eye,
    ShoppingCart,
    CheckCircle2,
    Package,
    Truck,
    ShoppingBag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import OrderDetailSidebar from '../../components/order/OrderDetailSidebar';

const TABS = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
];

const ManageOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [filters, setFilters] = useState<any>({
        search: '',
        page: 1,
        limit: 10,
        populate: ['userId']
    });

    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1
    });

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = {
                ...filters,
                orderStatus: activeTab === 'ALL' ? undefined : activeTab
            };
            const response = await orderService.getAll(queryParams);
            if (response) {
                setOrders(response.recordList || []);
                setPagination({
                    totalRecords: response.totalRecords || 0,
                    totalPages: response.totalPages || 0,
                    currentPage: response.currentPage || 1
                });
            }
        } catch (err: any) {
            console.error('Fetch error:', err);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, [filters, activeTab]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchOrders]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await orderService.updateStatus(id, newStatus);
            toast.success(`Order #${orders.find(o => o._id === id)?.orderNumber} moved to ${newStatus}`);
            fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const columns: Column<Order>[] = [
        {
            header: 'Order Details',
            key: 'orderNumber',
            render: (order) => {
                const date = new Date(order.createdAt);
                return (
                    <div className="flex items-center gap-4 py-1">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
                            <ShoppingCart size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 leading-tight">#{order.orderNumber}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-mono mt-1">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Customer',
            key: 'user',
            render: (order) => (
                <div className="flex flex-col py-1">
                    <span className="font-bold text-gray-900 leading-tight">
                        {order.userId?.firstName} {order.userId?.lastName}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 mt-1">{order.userId?.email}</span>
                </div>
            )
        },
        {
            header: 'Value & Settlement',
            key: 'amount',
            render: (order) => (
                <div className="flex flex-col py-1">
                    <div className="flex items-center gap-1.5 font-black text-primary text-base">
                        <span>₹{order.totalAmount.toFixed(2)}</span>
                        {order.couponCode && (
                            <span className="text-[9px] bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded-md border border-rose-100 flex items-center gap-0.5" title={`Coupon: ${order.couponCode}`}>
                                <Ticket size={10} />
                                -₹{order.discountAmount?.toFixed(0)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-2 py-0.5 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                        {order.paymentMethod === 'ONLINE' ? <CreditCard size={10} className="text-primary/60" /> : <Banknote size={10} className="text-primary/60" />}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {order.paymentMethod} • {order.paymentStatus}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Workflow Stage',
            key: 'orderStatus',
            render: (order) => {
                const colors: any = {
                    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
                    CONFIRMED: 'bg-blue-50 text-blue-600 border-blue-100',
                    PROCESSING: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                    SHIPPED: 'bg-purple-50 text-purple-600 border-purple-100',
                    DELIVERED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                    CANCELLED: 'bg-rose-50 text-rose-500 border-rose-100'
                };
                return (
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border ${colors[order.orderStatus] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                        {order.orderStatus}
                    </span>
                );
            }
        },
        {
            header: 'Next Strategic Action',
            key: 'actions',
            align: 'right',
            render: (order) => {
                const isAcceptable = order.orderStatus === 'PENDING';
                const isProcessable = order.orderStatus === 'CONFIRMED';
                const isShippable = order.orderStatus === 'PROCESSING';
                const isDeliverable = order.orderStatus === 'SHIPPED';

                return (
                    <div className="flex items-center justify-end gap-2">
                        {isAcceptable && (
                            <button
                                onClick={() => handleStatusUpdate(order._id, 'CONFIRMED')}
                                className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <CheckCircle2 size={12} /> Confirm
                            </button>
                        )}
                        {isProcessable && (
                            <button
                                onClick={() => handleStatusUpdate(order._id, 'PROCESSING')}
                                className="px-4 py-2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <Package size={12} /> Process
                            </button>
                        )}
                        {isShippable && (
                            <button
                                onClick={() => handleStatusUpdate(order._id, 'SHIPPED')}
                                className="px-4 py-2 bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <Truck size={12} /> Ship
                            </button>
                        )}
                        {isDeliverable && (
                            <button
                                onClick={() => handleStatusUpdate(order._id, 'DELIVERED')}
                                className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <ShoppingBag size={12} /> Deliver
                            </button>
                        )}

                        <div className="h-6 w-px bg-gray-100 mx-1" />

                        <button
                            onClick={() => setSelectedOrderId(order._id)}
                            className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 group active:scale-90"
                            title="Intelligence View"
                        >
                            <Eye size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <ShoppingBag size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Order Ecosystem</h1>
                        <p className="text-sm text-gray-500 font-medium">Monitoring and processing automated commerce lifecycles</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 flex flex-col items-center">
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest leading-none mb-1">Active Volume</span>
                        <span className="text-2xl font-black text-primary">{pagination.totalRecords}</span>
                    </div>
                </div>
            </div>

            {/* Top Bar with Search and Tabs */}
            <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
                <div className="bg-white p-1.5 rounded-[2rem] border-2 border-primary/5 shadow-xl shadow-gray-100/50 flex flex-wrap gap-1 h-auto min-h-16 items-center px-4">
                    {TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => {
                                setActiveTab(tab.value);
                                setFilters((p: any) => ({ ...p, page: 1 }));
                            }}
                            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.value
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 relative group w-full xl:w-auto mt-2 xl:mt-0">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan ledger by order # or customer identity..."
                        value={filters.search}
                        onChange={(e) => setFilters((prev: any) => ({ ...prev, search: e.target.value, page: 1 }))}
                        className="w-full bg-white border-2 border-primary/5 rounded-[2rem] py-5 pl-16 pr-6 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50 h-16 placeholder:text-gray-300"
                    />
                </div>

                <button
                    onClick={() => {
                        setFilters({ search: '', page: 1, limit: 10, populate: ['userId'] });
                        setActiveTab('ALL');
                    }}
                    className="px-8 py-4 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50 h-16"
                >
                    <RotateCcw size={18} />
                    Reset
                </button>
            </div>

            <Table
                data={orders}
                columns={columns}
                isLoading={loading}
                keyExtractor={(order) => order._id}
                emptyMessage="No strategic orders found for this criteria"
                onRowClick={(order) => setSelectedOrderId(order._id)}
                pagination={pagination.totalRecords > 0 ? {
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalRecords: pagination.totalRecords,
                    pageSize: filters.limit || 10,
                    onPageChange: (page) => setFilters((prev: any) => ({ ...prev, page })),
                    hasPreviousPage: pagination.currentPage > 1,
                    hasNextPage: pagination.currentPage < pagination.totalPages
                } : undefined}
            />

            <OrderDetailSidebar
                orderId={selectedOrderId}
                onClose={() => setSelectedOrderId(null)}
                onUpdate={fetchOrders}
            />
        </div>
    );
};

export default ManageOrders;

