
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Bell,
    RotateCcw,
    Info,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Megaphone,
    Package
} from 'lucide-react';
import { notificationService } from '../../services/notification.service';
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS } from '../../types/notification.types';
import type { Notification } from '../../types/notification.types';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table';
import { PopupModal } from '../../components/common/PopupModal';

const NotificationList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: search || undefined,
                type: type || undefined,
                status: status || undefined,
            };
            const response = await notificationService.getWithPagination(params);
            if (response && response.data) {
                setNotifications(response.data.recordList || []);
                setTotalRecords(response.data.totalRecords || 0);
                setTotalPages(response.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, type, status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchNotifications();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchNotifications]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchParams(prev => {
            prev.set('search', e.target.value);
            prev.set('page', '1');
            return prev;
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        setSearchParams(prev => {
            if (value) {
                prev.set(key, value);
            } else {
                prev.delete(key);
            }
            prev.set('page', '1');
            return prev;
        });
    };

    const handleDelete = (id: string) => {
        setNotificationToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!notificationToDelete) return;
        try {
            await notificationService.deleteByFilter(notificationToDelete);
            toast.success('Notification deleted successfully');
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        } finally {
            setIsDeleteModalOpen(false);
            setNotificationToDelete(null);
        }
    };

    const getTypeIcon = (type: NOTIFICATION_TYPE) => {
        switch (type) {
            case NOTIFICATION_TYPE.INFO: return <Info size={18} className="text-blue-500" />;
            case NOTIFICATION_TYPE.SUCCESS: return <CheckCircle size={18} className="text-emerald-500" />;
            case NOTIFICATION_TYPE.WARNING: return <AlertTriangle size={18} className="text-amber-500" />;
            case NOTIFICATION_TYPE.ERROR: return <XCircle size={18} className="text-rose-500" />;
            case NOTIFICATION_TYPE.PROMOTION: return <Megaphone size={18} className="text-purple-500" />;
            case NOTIFICATION_TYPE.ORDER_UPDATE: return <Package size={18} className="text-orange-500" />;
            default: return <Bell size={18} className="text-gray-500" />;
        }
    };

    const getStatusColor = (status: NOTIFICATION_STATUS) => {
        switch (status) {
            case NOTIFICATION_STATUS.ACTIVE: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case NOTIFICATION_STATUS.INACTIVE: return 'bg-gray-50 text-gray-500 border-gray-100';
            case NOTIFICATION_STATUS.DELETED: return 'bg-rose-50 text-rose-500 border-rose-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const columns: Column<Notification>[] = [
        {
            header: 'Notification',
            key: 'title',
            render: (notif) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-inner">
                        {getTypeIcon(notif.type)}
                    </div>
                    <div className="flex flex-col max-w-md">
                        <p className="font-bold text-gray-900 leading-tight tracking-wide truncate">{notif.title}</p>
                        <p className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-tighter truncate">
                            {notif.message}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: 'Type',
            key: 'type',
            render: (notif) => (
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    {notif.type}
                </span>
            )
        },
        {
            header: 'Target User',
            key: 'userId',
            render: (notif) => (
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    {notif.userId || 'Global (All)'}
                </span>
            )
        },
        {
            header: 'Date Created',
            key: 'createdAt',
            render: (notif) => (
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-900">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (notif) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${getStatusColor(notif.status)}`}>
                    {notif.status}
                </span>
            )
        },
        {
            header: 'Action',
            key: 'actions',
            align: 'right',
            render: (notif) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate(`/notifications/edit/${notif._id}`)}
                        className="p-3 text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 group"
                        title="Edit"
                    >
                        <Edit size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={() => handleDelete(notif._id)}
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 group"
                        title="Delete"
                    >
                        <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                        <Bell size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Notifications</h1>
                        <p className="text-sm text-gray-500 font-medium">Manage system alerts and promotional messages</p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate('/notifications/create')}
                    className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8 relative z-10"
                >
                    <Plus size={20} className="mr-2" />
                    <span>Send Notification</span>
                </Button>
            </div>

            {/* Top Bar with Search and Filters */}
            <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="flex-1 relative group w-full xl:w-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full bg-white border-2 border-primary/5 rounded-[2rem] py-5 pl-16 pr-6 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50 h-16"
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full xl:w-auto h-full items-center">
                    <div className="flex items-center gap-3 bg-white border-2 border-primary/5 rounded-[2rem] px-6 h-16 shadow-xl shadow-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Type</span>
                        <select
                            className="bg-transparent focus:outline-none font-black text-primary uppercase text-[10px] tracking-widest cursor-pointer"
                            value={type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                            <option value="">All Types</option>
                            {Object.values(NOTIFICATION_TYPE).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 bg-white border-2 border-primary/5 rounded-[2rem] px-6 h-16 shadow-xl shadow-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status</span>
                        <select
                            className="bg-transparent focus:outline-none font-black text-primary uppercase text-[10px] tracking-widest cursor-pointer"
                            value={status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            {Object.values(NOTIFICATION_STATUS).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {(search || type || status) && (
                        <button
                            onClick={() => setSearchParams({ page: '1', limit: '10' })}
                            className="px-8 h-16 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50"
                        >
                            <RotateCcw size={18} />
                            Reset Hub
                        </button>
                    )}
                </div>
            </div>

            <Table
                data={notifications}
                columns={columns}
                isLoading={loading}
                keyExtractor={(notif) => notif._id}
                emptyMessage="No notifications found"
                pagination={totalRecords > 0 ? {
                    currentPage: page,
                    totalPages: totalPages,
                    totalRecords: totalRecords,
                    pageSize: limit,
                    onPageChange: (p) => setSearchParams(prev => { prev.set('page', p.toString()); return prev; }),
                    hasPreviousPage: page > 1,
                    hasNextPage: page < totalPages
                } : undefined}
            />

            {isDeleteModalOpen && (
                <PopupModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setNotificationToDelete(null);
                    }}
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this notification? This action cannot be undone."
                    type="confirm"
                    onConfirm={confirmDelete}
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                />
            )}
        </div>
    );
};

export default NotificationList;
