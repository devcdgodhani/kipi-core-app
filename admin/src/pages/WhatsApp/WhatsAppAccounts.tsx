
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { whatsappAccountService, type IWhatsAppAccount } from '../../services/whatsappAccount.service';
import { Table, type Column } from '../../components/common/Table';
import { Play, Pause, RefreshCw, Smartphone, Power, Trash2, XCircle, QrCode, Edit, ShieldCheck, Activity, BarChart2, Plus, Filter, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PopupModal } from '../../components/common/PopupModal';
import CustomButton from '../../components/common/Button';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';

const WhatsAppAccounts = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [selectedAccount, setSelectedAccount] = useState<IWhatsAppAccount | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

    // Form States
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountNumber, setNewAccountNumber] = useState('');
    const [newAccountDate, setNewAccountDate] = useState(new Date().toISOString().split('T')[0]);

    const [accounts, setAccounts] = useState<IWhatsAppAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const status = searchParams.get('status');
    const socketStatus = searchParams.get('socketStatus');

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const filter: any = {};
            if (status) filter.status = status;
            if (socketStatus) filter.socketStatus = socketStatus;

            const response: any = await whatsappAccountService.getWithPagination({
                page,
                limit,
                filter,
                sort: { createdAt: -1 }
            });

            const data = response.data || response;
            if (data) {
                setAccounts(data.recordList || []);
                setTotalRecords(data.totalRecords || 0);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            toast.error('Failed to fetch accounts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [page, status, socketStatus]);

    // Targeted polling only when QR modal is open to detect scan
    useEffect(() => {
        let interval: any;
        if (isQRModalOpen) {
            interval = setInterval(fetchAccounts, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isQRModalOpen]);

    // Auto-close QR modal when connected
    useEffect(() => {
        if (isQRModalOpen && selectedAccount) {
            const current = accounts.find(a => a._id === selectedAccount._id);
            if (current && current.socketStatus === 'CONNECTED') {
                setIsQRModalOpen(false);
                setSelectedAccount(null);
            }
        }
    }, [accounts, isQRModalOpen, selectedAccount]);

    const handleApplyFilters = (filters: Record<string, any>) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '1');

            if (filters.status) newParams.set('status', filters.status);
            else newParams.delete('status');

            if (filters.socketStatus) newParams.set('socketStatus', filters.socketStatus);
            else newParams.delete('socketStatus');

            return newParams;
        });
    };

    const handleReset = () => {
        setSearchParams({});
    };

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await whatsappAccountService.create({
                name: newAccountName,
                number: newAccountNumber,
                numberActivatedAt: new Date(newAccountDate).toISOString(),
            });
            setIsCreateModalOpen(false);
            setNewAccountName('');
            setNewAccountNumber('');
            setNewAccountDate(new Date().toISOString().split('T')[0]);
            fetchAccounts();
            toast.success('Account created successfully');
        } catch (error: any) {
            toast.error(`Error creating account: ${error.message}`);
        }
    };

    const handleAction = async (id: string, action: 'pause' | 'resume' | 'disable' | 'logout' | 'initialize' | 'terminate' | 'delete') => {
        try {
            if (action === 'delete') {
                setAccountToDelete(id);
                setIsDeleteModalOpen(true);
                return;
            } else {
                if (action === 'pause') await whatsappAccountService.pause(id);
                if (action === 'resume') await whatsappAccountService.resume(id);
                if (action === 'disable') await whatsappAccountService.disable(id);
                if (action === 'logout') await whatsappAccountService.logout(id);
                if (action === 'initialize') await whatsappAccountService.initialize(id);
                if (action === 'terminate') await whatsappAccountService.terminate(id);
            }
            fetchAccounts();
            toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} action successful`);
        } catch (error: any) {
            toast.error(`Error: ${error.message || 'Action failed'}`);
        }
    };

    const confirmDelete = async () => {
        if (!accountToDelete) return;
        try {
            await whatsappAccountService.delete(accountToDelete);
            toast.success('Account deleted successfully');
            fetchAccounts();
        } catch (error: any) {
            toast.error(`Error deleting account: ${error.message}`);
        } finally {
            setIsDeleteModalOpen(false);
            setAccountToDelete(null);
        }
    };

    const openQR = (account: IWhatsAppAccount) => {
        setSelectedAccount(account);
        setIsQRModalOpen(true);
    };

    const filterFields: FilterField[] = [
        {
            key: 'status',
            label: 'Account Status',
            type: 'select',
            options: [
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Cooldown', value: 'COOLDOWN' },
                { label: 'Blocked', value: 'BLOCKED' },
                { label: 'Disabled', value: 'DISABLED' }
            ]
        },
        {
            key: 'socketStatus',
            label: 'Socket Status',
            type: 'select',
            options: [
                { label: 'Connected', value: 'CONNECTED' },
                { label: 'Disconnected', value: 'DISCONNECTED' },
                { label: 'Initializing', value: 'INITIALIZING' },
                { label: 'QR Ready', value: 'QR_READY' }
            ]
        }
    ];

    const currentFilters = {
        status: status,
        socketStatus: socketStatus
    };

    const columns: Column<IWhatsAppAccount>[] = [
        {
            header: 'Identity',
            render: (account) => (
                <div className="flex items-center gap-4 py-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-sm">
                        <Smartphone size={24} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-black text-gray-900 font-mono tracking-tight truncate">{account.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none">
                                {account.number || 'Pending'}
                            </span>
                            {account.isAutoResume && (
                                <span className="text-[8px] px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded-md border border-indigo-100 font-black uppercase tracking-tighter">
                                    Auto-Resume
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Health Matrix',
            render: (account) => {
                const score = account.riskScore || 0;
                const colors = score >= 80 ? 'text-rose-600 bg-rose-50' : score >= 50 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';

                return (
                    <div className="flex flex-col gap-2 w-32">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Risk Level</span>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${colors}`}>{score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                            <div
                                className={`h-full transition-all duration-1000 ${score >= 80 ? 'bg-rose-500' : score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${score}%` }}
                            />
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Telemetrics',
            render: (account) => (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <Activity size={12} className="text-primary" />
                        Today: <span className="font-black text-gray-900 ml-1">{account.sentToday || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <BarChart2 size={12} className="text-indigo-400" />
                        Total: <span className="font-black text-gray-900 ml-1">{account.metadata?.totalSent || 0}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Live State',
            render: (account) => (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${account.socketStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{account.socketStatus}</span>
                    </div>
                    {account.socketStatus === 'QR_READY' && account.qrCode && (
                        <button
                            onClick={() => openQR(account)}
                            className="text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md border border-indigo-100 hover:bg-indigo-100 transition-colors w-fit"
                        >
                            Open Terminal
                        </button>
                    )}
                </div>
            )
        },
        {
            header: 'Policy Status',
            render: (account) => {
                const colors: any = {
                    ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                    COOLDOWN: 'bg-amber-50 text-amber-600 border-amber-100',
                    BLOCKED: 'bg-rose-50 text-rose-600 border-rose-100',
                    DISABLED: 'bg-gray-50 text-gray-600 border-gray-100'
                };
                return (
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${colors[account.status] || colors.DISABLED}`}>
                        {account.status}
                    </span>
                );
            }
        },
        {
            header: 'Command Center',
            align: 'right',
            render: (account) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={() => navigate(`edit/${account._id}`)}
                        className="p-2 text-gray-400 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                        title="Edit Architecture"
                    >
                        <Edit size={16} />
                    </button>

                    <div className="w-px h-4 bg-gray-100 mx-1" />

                    {account.socketStatus === 'CONNECTED' ? (
                        <button
                            onClick={() => handleAction(account._id, 'logout')}
                            className="p-2 text-rose-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                            title="Deauthenticate"
                        >
                            <Power size={16} />
                        </button>
                    ) : (
                        <div className="flex gap-1">
                            {account.socketStatus === 'QR_READY' && account.qrCode ? (
                                <button
                                    onClick={() => openQR(account)}
                                    className="p-2 text-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                                    title="View QR Uplink"
                                >
                                    <QrCode size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleAction(account._id, 'initialize')}
                                    className="p-2 text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
                                    title="Initialize Core"
                                >
                                    <RefreshCw size={16} className={loading && selectedAccount?._id === account._id ? 'animate-spin' : ''} />
                                </button>
                            )}
                            {(account.socketStatus === 'INITIALIZING' || account.socketStatus === 'QR_READY') && (
                                <button
                                    onClick={() => handleAction(account._id, 'terminate')}
                                    className="p-2 text-rose-300 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                                    title="Kill Process"
                                >
                                    <XCircle size={16} />
                                </button>
                            )}
                        </div>
                    )}

                    <div className="w-px h-4 bg-gray-100 mx-1" />

                    {account.status === 'ACTIVE' ? (
                        <button
                            onClick={() => handleAction(account._id, 'pause')}
                            className="p-2 text-amber-400 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all"
                            title="Suspend Traffic"
                        >
                            <Pause size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleAction(account._id, 'resume')}
                            className="p-2 text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
                            title="Restore Traffic"
                        >
                            <Play size={16} />
                        </button>
                    )}

                    <div className="w-px h-4 bg-gray-100 mx-1" />

                    <button
                        onClick={() => handleAction(account._id, 'delete')}
                        className="p-2 text-gray-300 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                        title="Purge Archive"
                    >
                        <Trash2 size={16} />
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
                    <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                        <Smartphone size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Origin Terminals</h1>
                        <p className="text-sm text-gray-500 font-medium">Manage sending instances and socket health matrix</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-4">
                    <CustomButton
                        onClick={() => setIsCreateModalOpen(true)}
                        className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8"
                    >
                        <Plus size={20} className="mr-2" />
                        <span>Deploy Account</span>
                    </CustomButton>
                    <button
                        onClick={() => fetchAccounts()}
                        className="bg-white text-gray-400 hover:text-primary border-2 border-primary/5 h-14 w-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-gray-100/50"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="flex-1 w-full xl:w-auto" />

                <div className="flex flex-wrap gap-3 w-full xl:w-auto h-full items-center justify-end">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`px-8 h-16 rounded-[2rem] border-2 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl ${(status || socketStatus)
                                ? 'bg-primary text-white border-primary shadow-primary/20 hover:bg-primary/90'
                                : 'bg-white border-primary/5 text-gray-400 hover:border-primary/20 hover:text-primary shadow-gray-100/50'
                            }`}
                    >
                        <Filter size={18} />
                        {(status || socketStatus) ? 'Neural Filters ON' : 'Scrub Matrix'}
                    </button>

                    {(status || socketStatus) && (
                        <button
                            onClick={handleReset}
                            className="px-8 h-16 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50"
                        >
                            <RotateCcw size={18} />
                            Reset Hub
                        </button>
                    )}
                </div>
            </div>

            <Table
                data={accounts}
                columns={columns}
                isLoading={loading}
                keyExtractor={(item) => item._id}
                emptyMessage="No autonomous terminals registered in the cloud"
                pagination={totalRecords > 0 ? {
                    currentPage: page,
                    totalPages: Math.ceil(totalRecords / limit),
                    totalRecords: totalRecords,
                    pageSize: limit,
                    onPageChange: (p) => setSearchParams(prev => { prev.set('page', p.toString()); return prev; }),
                    hasPreviousPage: page > 1,
                    hasNextPage: page < Math.ceil(totalRecords / limit)
                } : undefined}
            />

            <CommonFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                fields={filterFields}
                onApply={handleApplyFilters}
                currentFilters={currentFilters}
            />

            {/* Create Account Modal - Kept for Inline Creation */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-primary/10 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Deploy Terminal</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Register new origin instance</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateAccount} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Terminal Alias</label>
                                <input
                                    type="text"
                                    value={newAccountName}
                                    onChange={(e) => setNewAccountName(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-gray-700"
                                    placeholder="e.g. ALPHA-TERMINAL-1"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Number</label>
                                <input
                                    type="text"
                                    value={newAccountNumber}
                                    onChange={(e) => setNewAccountNumber(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-gray-700"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Activation Cycle Start</label>
                                <input
                                    type="date"
                                    value={newAccountDate}
                                    onChange={(e) => setNewAccountDate(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-gray-700"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-4 py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <CustomButton
                                    type="submit"
                                    className="flex-1 h-14 rounded-2xl shadow-xl shadow-primary/20"
                                >
                                    Initiate Deployment
                                </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {isQRModalOpen && selectedAccount && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl border border-primary/10 flex flex-col items-center animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mb-6">
                            <QrCode size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Neural Uplink</h2>
                        <p className="text-xs text-gray-400 font-medium mb-8">Synchronize WhatsApp mobile application with terminal <span className="text-primary font-black">{selectedAccount.name}</span></p>

                        <div className="mb-8 p-3 bg-white border-2 border-dashed border-gray-200 rounded-[2rem] shadow-inner">
                            {selectedAccount.qrCode ? (
                                <img src={selectedAccount.qrCode} alt="WhatsApp QR Code" className="w-64 h-64 object-contain rounded-2xl" />
                            ) : (
                                <div className="w-64 h-64 flex flex-col items-center justify-center text-gray-400 gap-4">
                                    <RefreshCw className="animate-spin" size={32} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Generating Payload...</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsQRModalOpen(false)}
                            className="w-full px-4 py-4 bg-gray-50 text-gray-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-gray-100 hover:text-gray-900 transition-all"
                        >
                            Disconnect Port
                        </button>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <PopupModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setAccountToDelete(null);
                    }}
                    title="Purge Archive"
                    message="Are you sure you want to permanently erase this terminal? Neural sync will be lost forever."
                    type="confirm"
                    onConfirm={confirmDelete}
                    confirmLabel="Purge Now"
                    cancelLabel="Cancel"
                />
            )}
        </div>
    );
};

export default WhatsAppAccounts;
