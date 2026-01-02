import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, type Column } from '../../components/common/Table';
import { orderService } from '../../services/order.service';
import type { Order } from '../../types/order.types';
import {
    Search,
    CreditCard,
    Banknote,
    Ticket,
    Eye,
    ShoppingCart,
    CheckCircle2,
    Package,
    Truck,
    ShoppingBag,
    Filter,
    RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import OrderDetailSidebar from '../../components/order/OrderDetailSidebar';
import CustomButton from '../../components/common/Button';

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
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = searchParams.get('status') || 'ALL';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1
    });

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = {
                page,
                limit,
                search,
                populate: ['userId'],
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
    }, [page, limit, search, activeTab]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchOrders]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await orderService.updateStatus(id, newStatus);
            toast.success(`Order #${orders.find(o => o._id === id)?.orderNumber} transitioned to ${newStatus}`);
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
            header: 'Settlement Delta',
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
            header: 'Lifecycle State',
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
            header: 'Strategic Controls',
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
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'CONFIRMED'); }}
                                className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <CheckCircle2 size={12} /> Confirm
                            </button>
                        )}
                        {isProcessable && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'PROCESSING'); }}
                                className="px-4 py-2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <Package size={12} /> Process
                            </button>
                        )}
                        {isShippable && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'SHIPPED'); }}
                                className="px-4 py-2 bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <Truck size={12} /> Ship
                            </button>
                        )}
                        {isDeliverable && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'DELIVERED'); }}
                                className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <ShoppingBag size={12} /> Deliver
                            </button>
                        )}

                        <div className="h-6 w-px bg-gray-100 mx-1" />

                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order._id); }}
                            className="p-3 text-gray-400 hover:text-primary hover:bg-white hover:border-primary/10 hover:shadow-md rounded-2xl transition-all border border-transparent group active:scale-90 bg-gray-50/50"
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
        <div className="p-6 space-y-6 flex flex-col h-full bg-gray-50/50 animate-in fade-in duration-500 overflow-hidden">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <ShoppingBag size={32} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono truncate">Order Ecosystem</h1>
                        <p className="text-sm text-gray-500 font-medium truncate">Monitoring and processing automated commerce lifecycles</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="hidden lg:flex flex-col items-end mr-6 text-right border-r border-gray-100 pr-6">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Volume</span>
                        <span className="text-2xl font-mono font-black text-primary leading-none">{pagination.totalRecords}</span>
                    </div>
                    <CustomButton
                        onClick={() => fetchOrders()}
                        className="bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-none border border-gray-200 h-14 w-14 p-0 rounded-2xl flex items-center justify-center transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </CustomButton>
                </div>
            </div>

            {/* Intelligence Control Bar */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-primary/5 flex flex-col xl:flex-row items-center justify-between gap-4">
                <div className="relative w-full xl:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan ledger by ID or identity..."
                        className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-[1.5rem] outline-none transition-all font-bold text-gray-700 h-14"
                        value={search}
                        onChange={(e) => setSearchParams(prev => {
                            if (e.target.value) prev.set('search', e.target.value);
                            else prev.delete('search');
                            prev.set('page', '1');
                            return prev;
                        })}
                    />
                </div>

                <div className="flex-1 flex items-center justify-center overflow-x-auto no-scrollbar py-2">
                    <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                        {TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setSearchParams(prev => {
                                    prev.set('status', tab.value);
                                    prev.set('page', '1');
                                    return prev;
                                })}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.value
                                    ? 'bg-white text-primary shadow-sm border border-primary/10'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        className="flex items-center gap-2 px-6 h-14 bg-white text-gray-500 border-2 border-gray-100 hover:bg-gray-50 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                        <Filter size={18} />
                        Strategic Filter
                    </button>

                    <CustomButton
                        onClick={() => setSearchParams({})}
                        className="h-14 px-6 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-2xl border border-gray-200 shadow-none font-black uppercase text-[10px] tracking-widest"
                    >
                        Reset Hub
                    </CustomButton>
                </div>
            </div>

            {/* Neural Data Grid */}
            <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] border border-primary/5 shadow-sm overflow-hidden flex flex-col">
                <Table
                    data={orders}
                    columns={columns as any}
                    isLoading={loading}
                    keyExtractor={(order) => order._id}
                    emptyMessage="No strategic orders found for this criteria"
                    onRowClick={(order) => setSelectedOrderId(order._id)}
                    pagination={pagination.totalRecords > 0 ? {
                        currentPage: pagination.currentPage,
                        totalPages: pagination.totalPages,
                        totalRecords: pagination.totalRecords,
                        pageSize: limit,
                        onPageChange: (p) => setSearchParams(prev => { prev.set('page', p.toString()); return prev; }),
                        hasPreviousPage: pagination.currentPage > 1,
                        hasNextPage: pagination.currentPage < pagination.totalPages
                    } : undefined}
                />
            </div>

            <OrderDetailSidebar
                orderId={selectedOrderId}
                onClose={() => setSelectedOrderId(null)}
                onUpdate={fetchOrders}
            />
        </div>
    );
};

export default ManageOrders;
