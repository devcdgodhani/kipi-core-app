import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    RefreshCw,
    Edit,
    Trash2,
    Download,
    UserPlus
} from 'lucide-react';
import { userService } from '../../../api/services/user.service';
import type { IUser, IPaginationData } from '../../../types';
import { Button, Pagination } from '../../../components/common';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';

const UserManagement = () => {
    const [users, setUsers] = useState<IUser[]>([]);
    const [pagination, setPagination] = useState<IPaginationData<IUser> | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.getWithPagination({
                page: currentPage,
                limit,
                search: searchTerm || undefined, // Send search term to API
            });

            if (response.status === 200 || response.code === 'OK') {
                setPagination(response.data);
                setUsers(response.data.recordList);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search to avoid too many API calls
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, searchTerm ? 500 : 0); // 500ms debounce for search, immediate for other changes

        return () => clearTimeout(timeoutId);
    }, [currentPage, limit, searchTerm]);


    const handleEdit = (user: IUser) => {
        setSelectedUser(user);
        setEditModalOpen(true);
    };

    const handleDelete = (user: IUser) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    const handleModalSuccess = () => {
        fetchUsers();
    };

    const getStatusBadge = (status: string) => {
        return status === 'ACTIVE'
            ? 'bg-green-500/10 text-green-400 border-green-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20';
    };

    const getUserTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            MASTER_ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            ADMIN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            SUPPLIER: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            CUSTOMER: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        };
        return colors[type] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };



    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-brand-500/20 to-purple-500/20 rounded-2xl">
                        <Users className="w-8 h-8 text-brand-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-text-primary tracking-tight">User Management</h1>
                        <p className="text-text-secondary text-sm font-medium mt-1">
                            Manage system users and permissions
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={fetchUsers}
                        variant="secondary"
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                        Refresh
                    </Button>
                    <Button
                        onClick={() => setCreateModalOpen(true)}
                        leftIcon={<UserPlus className="w-4 h-4" />}
                    >
                        Create User
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="p-6 bg-surface border border-border rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Total Users</p>
                            <p className="text-3xl font-black text-text-primary mt-2">{pagination?.totalRecords || 0}</p>
                        </div>
                        <div className="p-3 bg-brand-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-brand-500" />
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-surface border border-border rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Active</p>
                            <p className="text-3xl font-black text-green-500 mt-2">
                                {users.filter(u => u.status === 'ACTIVE').length}
                            </p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-surface border border-border rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Inactive</p>
                            <p className="text-3xl font-black text-red-500 mt-2">
                                {users.filter(u => u.status === 'INACTIVE').length}
                            </p>
                        </div>
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-red-500" />
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-surface border border-border rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Current Page</p>
                            <p className="text-3xl font-black text-text-primary mt-2">
                                {currentPage} / {pagination?.totalPages || 1}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Filter className="w-6 h-6 text-purple-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search users by name, email, or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-colors"
                    />
                </div>
                <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
                    Export
                </Button>
            </div>

            {/* Users Table */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-surface-hover/50">
                                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-text-secondary">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-text-secondary">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-text-secondary">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-text-secondary">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-text-secondary">
                                    Verified
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-text-secondary">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <RefreshCw className="w-5 h-5 text-brand-500 animate-spin" />
                                            <span className="text-text-secondary font-medium">Loading users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="border-b border-border hover:bg-surface-hover transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                                                    <span className="text-white font-black text-sm">
                                                        {user.firstName[0]}{user.lastName[0]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-text-primary font-bold">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="text-xs text-text-secondary font-medium">
                                                        @{user.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm text-text-primary">{user.email}</p>
                                                <p className="text-xs text-text-secondary">
                                                    {user.countryCode} {user.mobile}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase border ${getUserTypeBadge(user.type)}`}>
                                                {user.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase border ${getStatusBadge(user.status)}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {user.isEmailVerified && (
                                                    <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-lg text-xs font-bold">
                                                        Email
                                                    </span>
                                                )}
                                                {user.isMobileVerified && (
                                                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-xs font-bold">
                                                        Mobile
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors group"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4 text-text-secondary group-hover:text-blue-500" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-text-secondary group-hover:text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalRecords={pagination?.totalRecords || 0}
                    limit={limit}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Modals */}
            <CreateUserModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleModalSuccess}
            />
            <EditUserModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedUser(null);
                }}
                onSuccess={handleModalSuccess}
                user={selectedUser}
            />
            <DeleteUserModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedUser(null);
                }}
                onSuccess={handleModalSuccess}
                user={selectedUser}
            />
        </div>
    );
};

export default UserManagement;
