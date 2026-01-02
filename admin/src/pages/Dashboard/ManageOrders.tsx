import React, { useEffect, useState, useCallback } from 'react';
import { Table, type Column } from '../../components/common/Table';
import { orderService } from '../../services/order.service';
import type { Order } from '../../types/order.types';
import { Search, Filter, RotateCcw, Package, CreditCard, Banknote, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';

const ManageOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState<any>({
        search: '',
        orderStatus: undefined,
        paymentStatus: undefined,
        page: 1,
        limit: 10,
        isPaginate: true,
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
            const response = await orderService.getAll(filters);
            if (response && response.data) {
                setOrders(response.data.recordList);
                setPagination({
                    totalRecords: response.data.totalRecords,
                    totalPages: response.data.totalPages,
                    currentPage: response.data.currentPage
                });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await orderService.update(id, { orderStatus: newStatus as any });
            toast.success(`Order marked as ${newStatus}`);
            fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update order status');
        }
    };

    const filterFields: FilterField[] = [
        {
            key: 'orderStatus',
            label: 'Order Status',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Pending', value: 'PENDING' },
                { label: 'Confirmed', value: 'CONFIRMED' },
                { label: 'Processing', value: 'PROCESSING' },
                { label: 'Shipped', value: 'SHIPPED' },
                { label: 'Delivered', value: 'DELIVERED' },
                { label: 'Cancelled', value: 'CANCELLED' }
            ]
        },
        {
            key: 'paymentStatus',
            label: 'Payment Status',
            type: 'select',
            options: [
                { label: 'Pending', value: 'PENDING' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Failed', value: 'FAILED' }
            ]
        }
    ];

    const columns: Column<Order>[] = [
        {
            header: 'Order Info',
            key: 'orderNumber',
            render: (order) => (
                <div className="flex flex-col">
                    <span className="font-mono font-bold text-gray-900 group-hover:text-primary transition-colors">#{order.orderNumber}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: {order._id.slice(-6)}</span>
                </div>
            )
        },
        {
            header: 'Customer',
            key: 'user',
            render: (order) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 leading-tight">
                        {order.userId?.firstName} {order.userId?.lastName}
                    </span>
                    <span className="text-xs text-gray-500">{order.userId?.email}</span>
                </div>
            )
        },
        {
            header: 'Order Details',
            key: 'details',
            render: (order) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">₹{order.totalAmount.toFixed(2)}</span>
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-black text-gray-500 uppercase">{order.items.length} Items</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                        {order.paymentMethod === 'ONLINE' ? <CreditCard size={12} /> : <Banknote size={12} />}
                        {order.paymentMethod} • {order.paymentStatus}
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
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
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors[order.orderStatus] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                        {order.orderStatus}
                    </span>
                );
            }
        },
        {
            header: 'Date',
            key: 'createdAt',
            render: (order) => (
                <div className="text-xs text-gray-500 font-medium">
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}<br />
                    {format(new Date(order.createdAt), 'hh:mm a')}
                </div>
            )
        },
        {
            header: 'Actions',
            key: 'actions',
            align: 'right',
            render: (order) => (
                <div className="flex items-center justify-end gap-2">
                    <select
                        className="text-[10px] font-black uppercase tracking-widest bg-white border-2 border-primary/5 rounded-xl px-2 py-1 focus:outline-none focus:border-primary/20 transition-all cursor-pointer"
                        value={order.orderStatus}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirm</option>
                        <option value="PROCESSING">Process</option>
                        <option value="SHIPPED">Ship</option>
                        <option value="DELIVERED">Deliver</option>
                        <option value="CANCELLED">Cancel</option>
                    </select>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Order Management</h1>
                    <p className="text-sm text-gray-500 font-medium">Monitor and manage all customer orders</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                    <input
                        type="text"
                        placeholder="Search orders by number or customer..."
                        value={filters.search}
                        onChange={(e) => setFilters((prev: any) => ({ ...prev, search: e.target.value, page: 1 }))}
                        className="w-full bg-white border-2 border-primary/5 rounded-3xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="px-6 py-4 rounded-3xl border-2 bg-white border-primary/5 text-primary hover:bg-primary/5 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-3"
                    >
                        <Filter size={18} />
                        Filters
                    </button>
                    <button
                        onClick={() => setFilters({
                            search: '',
                            orderStatus: undefined,
                            paymentStatus: undefined,
                            page: 1,
                            limit: 10,
                            isPaginate: true,
                            populate: ['userId']
                        })}
                        className="p-4 rounded-3xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all border-2 border-transparent"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            <CommonFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                fields={filterFields}
                onApply={(u) => setFilters((p: any) => ({ ...p, ...u, page: 1 }))}
                currentFilters={filters}
            />

            <Table
                data={orders}
                columns={columns}
                isLoading={loading}
                keyExtractor={(order) => order._id}
                emptyMessage="No orders found"
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
        </div>
    );
};

export default ManageOrders;
