import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    UserPlus,
    Edit2,
    Trash2,
    ShieldCheck,
    ShieldAlert,
    Mail,
    Phone,
    RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/user.service';
import { type IUser, type IUserFilters, USER_STATUS, USER_TYPE } from '../../types/user';
import CustomButton from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { ROUTES } from '../../routes/routeConfig';
import { PopupModal } from '../../components/common/PopupModal';

const UserList: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [popup, setPopup] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'alert' | 'confirm' | 'prompt';
        onConfirm: () => void;
        loading?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        onConfirm: () => { }
    });

    // Filters & Pagination State
    const [filters, setFilters] = useState<IUserFilters>({
        search: '',
        status: undefined,
        type: undefined,
        isVerified: undefined,
        isMobileVerified: undefined,
        isEmailVerified: undefined,
        createdAt: undefined,
        page: 1,
        limit: 10,
        isPaginate: true
    });

    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1
    });

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await userService.getWithPagination(filters);
            if (response && response.data) {
                setUsers(response.data.recordList);
                setPagination({
                    totalRecords: response.data.totalRecords,
                    totalPages: response.data.totalPages,
                    currentPage: response.data.currentPage
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handleFilterChange = (updatedFilters: Record<string, any>) => {
        setFilters(prev => ({ ...prev, ...updatedFilters, page: 1 }));
    };

    const handleLimitChange = (newLimit: number) => {
        setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const handleDeleteUser = async (id: string) => {
        setPopup({
            isOpen: true,
            title: 'Delete User',
            message: 'Are you sure you want to delete this user? This action cannot be undone.',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await userService.delete(id);
                    fetchUsers();
                    setPopup(prev => ({ ...prev, isOpen: false, loading: false }));
                } catch (err: any) {
                    setPopup({
                        isOpen: true,
                        title: 'Error',
                        message: err.response?.data?.message || 'Failed to delete user',
                        type: 'alert',
                        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const handleStatusToggle = async (user: IUser) => {
        const newStatus = user.status === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
        try {
            await userService.update(user._id, { status: newStatus });
            fetchUsers();
        } catch (err: any) {
            setPopup({
                isOpen: true,
                title: 'Error',
                message: err.response?.data?.message || 'Failed to update status',
                type: 'alert',
                onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
            });
        }
    };

    const filterFields: FilterField[] = [
        {
            key: 'type',
            label: 'User Roles',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Admin', value: USER_TYPE.ADMIN },
                { label: 'Customer', value: USER_TYPE.CUSTOMER },
                { label: 'Supplier', value: USER_TYPE.SUPPLIER }
            ]
        },
        {
            key: 'status',
            label: 'Account Status',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Active', value: USER_STATUS.ACTIVE },
                { label: 'Inactive', value: USER_STATUS.INACTIVE }
            ]
        },
        {
            key: 'isVerified',
            label: 'Profile Verification',
            type: 'select',
            options: [
                { label: 'Verified', value: true },
                { label: 'Unverified', value: false }
            ]
        },
        {
            key: 'isMobileVerified',
            label: 'Mobile Verification',
            type: 'select',
            options: [
                { label: 'Verified', value: true },
                { label: 'Unverified', value: false }
            ]
        },
        {
            key: 'isEmailVerified',
            label: 'Email Verification',
            type: 'select',
            options: [
                { label: 'Verified', value: true },
                { label: 'Unverified', value: false }
            ]
        },
        {
            key: 'createdAt',
            label: 'Joined Date',
            type: 'date-range'
        }
    ];

    const activeFilterCount = Object.keys(filters).filter(k =>
        !['page', 'limit', 'isPaginate', 'search'].includes(k) &&
        filters[k as keyof IUserFilters] !== undefined &&
        (Array.isArray(filters[k as keyof IUserFilters]) ? (filters[k as keyof IUserFilters] as any[]).length > 0 : true)
    ).length;

    const columns: Column<IUser>[] = [
        {
            header: 'User Profile',
            key: 'profile',
            render: (user) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="relative group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-xl border border-primary/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
                            {user.firstName.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${user.status === USER_STATUS.ACTIVE ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight">{user.firstName} {user.lastName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-tighter border border-gray-200">ID: {user._id.slice(-6)}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter border ${user.type === USER_TYPE.ADMIN ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                user.type === USER_TYPE.SUPPLIER ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-slate-50 text-slate-600 border-slate-100'
                                }`}>
                                {user.type.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Credentials',
            key: 'credentials',
            render: (user) => (
                <div className="flex flex-col gap-1.5 py-1">
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-xl border border-gray-100 group hover:border-primary/20 transition-colors">
                        <Mail size={12} className="text-primary/40 group-hover:text-primary/70 transition-colors" />
                        <span className="text-xs font-semibold text-gray-600 truncate max-w-[180px]">{user.email}</span>
                        {user.isEmailVerified ? <ShieldCheck size={14} className="text-green-500 ml-auto" /> : <ShieldAlert size={14} className="text-amber-400 ml-auto" />}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-xl border border-gray-100 group hover:border-primary/20 transition-colors">
                        <Phone size={12} className="text-primary/40 group-hover:text-primary/70 transition-colors" />
                        <span className="text-xs font-semibold text-gray-600">{user.countryCode} {user.mobile}</span>
                        {user.isMobileVerified ? <ShieldCheck size={14} className="text-green-500 ml-auto" /> : <ShieldAlert size={14} className="text-amber-400 ml-auto" />}
                    </div>
                </div>
            )
        },
        {
            header: 'Security',
            key: 'security',
            render: (user) => (
                <div className="flex flex-col gap-2">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border ${user.isVerified
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-rose-50 text-rose-500 border-rose-100 opacity-60'
                        }`}>
                        {user.isVerified ? (
                            <><ShieldCheck size={12} /> Verified Profile</>
                        ) : (
                            <><ShieldAlert size={12} /> Pending Verification</>
                        )}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 px-1 italic">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                </div>
            )
        },
        {
            header: 'Action / Status',
            key: 'actions',
            align: 'right' as const,
            render: (user) => (
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={() => handleStatusToggle(user)}
                        className={`group relative flex items-center h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all overflow-hidden border-2 cursor-pointer ${user.status === USER_STATUS.ACTIVE
                            ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-100 hover:shadow-green-200'
                            : 'bg-white border-gray-100 text-gray-400 hover:border-primary/20 hover:text-primary shadow-sm'
                            }`}
                    >
                        <span className="relative z-10">{user.status}</span>
                        <div className={`absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ${user.status !== USER_STATUS.ACTIVE && 'hidden'}`} />
                    </button>

                    <div className="h-8 w-px bg-gray-100 mx-1" />

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => navigate('/' + ROUTES.DASHBOARD.USERS_EDIT.replace(':id', user._id))}
                            className="p-3 text-primary hover:bg-primary/5 rounded-2xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-primary/10"
                            title="Edit User"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-rose-100"
                            title="Delete User"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {error && (
                <div className="absolute top-4 right-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl z-20 animate-in fade-in slide-in-from-top-4 duration-300">
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">User Management</h1>
                    <p className="text-sm text-gray-500 font-medium">Create, manage and monitor platform users</p>
                </div>
                <CustomButton onClick={() => navigate('/' + ROUTES.DASHBOARD.USERS_CREATE)} className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8">
                    <UserPlus size={20} className="mr-2" /> Add New User
                </CustomButton>
            </div>

            {/* Top Bar with Search and Filter Trigger */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                    <input
                        type="text"
                        placeholder="Search users by name, email or phone..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                        className="w-full bg-white border-2 border-primary/5 rounded-3xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50"
                    />
                </div>

                <div className="flex gap-3">
                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => setFilters({
                                search: '',
                                status: undefined,
                                type: undefined,
                                isVerified: undefined,
                                isMobileVerified: undefined,
                                isEmailVerified: undefined,
                                createdAt: undefined,
                                page: 1,
                                limit: 10,
                                isPaginate: true
                            })}
                            className="px-4 py-4 rounded-3xl bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                        >
                            <RotateCcw size={14} />
                            Clear
                        </button>
                    )}
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`px-6 py-4 rounded-3xl border-2 flex items-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest ${activeFilterCount > 0
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white border-primary/5 text-primary hover:bg-primary/5'
                            }`}
                    >
                        <Filter size={18} />
                        Advanced Filters
                        {activeFilterCount > 0 && (
                            <span className="w-5 h-5 bg-white text-primary rounded-full flex items-center justify-center text-[10px]">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    <div className="flex items-center gap-1 bg-white border-2 border-primary/5 rounded-3xl px-4 py-2 shadow-lg shadow-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">View</span>
                        <select
                            value={filters.limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="bg-transparent focus:outline-none font-bold text-primary pl-1 cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Common Filter Modal */}
            <CommonFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                fields={filterFields}
                onApply={handleFilterChange}
                currentFilters={filters}
            />

            <Table
                data={users}
                columns={columns}
                isLoading={loading}
                keyExtractor={(user) => user._id}
                emptyMessage="No users found"
                pagination={pagination.totalRecords > 0 ? {
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalRecords: pagination.totalRecords,
                    pageSize: filters.limit || 10,
                    onPageChange: (page) => setFilters(prev => ({ ...prev, page })),
                    hasPreviousPage: pagination.currentPage > 1,
                    hasNextPage: pagination.currentPage < pagination.totalPages
                } : undefined}
            />

            <PopupModal
                isOpen={popup.isOpen}
                onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                onConfirm={popup.onConfirm}
                loading={popup.loading}
            />
        </div>
    );
};

export default UserList;
