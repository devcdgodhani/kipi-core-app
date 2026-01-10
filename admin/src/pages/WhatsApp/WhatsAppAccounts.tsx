import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { whatsappAccountService, type IWhatsAppAccount } from '../../services/whatsappAccount.service';
import { Table, type Column } from '../../components/common/Table';
import { Play, Pause, RefreshCw, Users, Smartphone, Power, Trash2, XCircle, QrCode, Edit, ShieldCheck, Activity, BarChart2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PopupModal } from '../../components/common/PopupModal';
import CustomButton from '../../components/common/Button';

const WhatsAppAccounts = () => {
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);

    const [selectedAccount, setSelectedAccount] = useState<IWhatsAppAccount | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

    // Form States
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountNumber, setNewAccountNumber] = useState('');
    const [newAccountDate, setNewAccountDate] = useState(new Date().toISOString().split('T')[0]);

    const [accounts, setAccounts] = useState<IWhatsAppAccount[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response: any = await whatsappAccountService.getAll();
            setAccounts(response.data || []);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

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

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await whatsappAccountService.create({ // Uses createAccount endpoint
                name: newAccountName,
                number: newAccountNumber,
                numberActivatedAt: new Date(newAccountDate).toISOString(), // Map "Activation Date" to numberActivatedAt
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


    const handleAction = async (id: string, action: 'pause' | 'resume' | 'cooldown' | 'disable' | 'logout' | 'initialize' | 'terminate' | 'delete') => {
        try {
            if (action === 'delete') {
                setAccountToDelete(id);
                setIsDeleteModalOpen(true);
                return;
            } else {
                if (action === 'pause') await whatsappAccountService.pause(id);
                if (action === 'resume') await whatsappAccountService.resume(id);
                // if (action === 'cooldown') await whatsappAccountService.forceCooldown(id); // Not implemented
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

    const columns: Column<IWhatsAppAccount>[] = [
        {
            header: 'Account Identity',
            key: 'name',
            render: (account) => (
                <div className="flex items-center gap-4 py-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <Smartphone size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 font-mono tracking-wide">{account.name}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{account.number || 'Pending Connection'}</span>
                            {account.isAutoResume && <span className="text-[9px] px-1 bg-blue-50 text-blue-600 rounded border border-blue-100">Auto-Resume</span>}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Risk Health',
            key: 'riskScore',
            render: (account) => {
                const score = account.riskScore || 0;
                let colorClass = 'bg-emerald-500';
                let textClass = 'text-emerald-600';
                let bgClass = 'bg-emerald-50';

                if (score >= 80) { colorClass = 'bg-rose-500'; textClass = 'text-rose-600'; bgClass = 'bg-rose-50'; }
                else if (score >= 50) { colorClass = 'bg-amber-500'; textClass = 'text-amber-600'; bgClass = 'bg-amber-50'; }

                return (
                    <div className="flex flex-col gap-1 w-24">
                        <div className="flex justify-between items-center">
                            <span className={`text-xs font-bold ${textClass}`}>{score}% Risk</span>
                            <ShieldCheck size={12} className={textClass} />
                        </div>
                        <div className={`h-1.5 w-full ${bgClass} rounded-full overflow-hidden`}>
                            <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${score}%` }}></div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Activity',
            key: 'sentToday',
            render: (account) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Activity size={12} />
                        <span className="font-medium">{account.sentToday || 0}</span>
                        <span className="text-gray-400">sent today</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <BarChart2 size={12} />
                        <span className="font-medium">{account.metadata?.totalSent || 0}</span>
                        <span className="text-gray-400">lifetime</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Connection',
            key: 'socketStatus',
            render: (account) => (
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${account.socketStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                    <span className="text-sm font-medium text-gray-700">{account.socketStatus}</span>
                    {account.socketStatus === 'QR_READY' && account.qrCode && (
                        <button onClick={() => openQR(account)} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100">
                            View QR
                        </button>
                    )}
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (account) => {
                const colors: any = {
                    ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                    COOLDOWN: 'bg-amber-50 text-amber-600 border-amber-100',
                    BLOCKED: 'bg-rose-50 text-rose-600 border-rose-100',
                    DISABLED: 'bg-gray-50 text-gray-600 border-gray-100',
                    DISCONNECTED: 'bg-gray-100 text-gray-500 border-gray-200'
                };
                return (
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${colors[account.status] || colors.DISABLED}`}>
                        {account.status}
                    </span>
                );
            }
        },
        {
            header: 'Controls',
            key: '_id',
            align: 'right',
            render: (account) => (
                <div className="flex items-center justify-end gap-2">

                    <button onClick={() => navigate(`edit/${account._id}`)} className="p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors" title="Edit / View Details">
                        <Edit size={16} />
                    </button>

                    <div className="w-px h-4 bg-gray-200 mx-1"></div>

                    {account.socketStatus === 'CONNECTED' ? (
                        <button onClick={() => handleAction(account._id, 'logout')} className="p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-colors" title="Logout (WhatsApp)">
                            <Power size={16} />
                        </button>
                    ) : (
                        <div className="flex gap-1">
                            {account.socketStatus === 'QR_READY' && account.qrCode ? (
                                <button onClick={() => openQR(account)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="View QR Code">
                                    <QrCode size={16} />
                                </button>
                            ) : (
                                <button onClick={() => handleAction(account._id, 'initialize')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Start Client">
                                    <RefreshCw size={16} />
                                </button>
                            )}
                            {account.socketStatus === 'INITIALIZING' || account.socketStatus === 'QR_READY' ? (
                                <button onClick={() => handleAction(account._id, 'terminate')} className="p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors" title="Terminate Client">
                                    <XCircle size={16} />
                                </button>
                            ) : null}
                        </div>
                    )}

                    <div className="w-px h-4 bg-gray-200 mx-1"></div>

                    {account.status === 'ACTIVE' ? (
                        <button onClick={() => handleAction(account._id, 'pause')} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Pause Sending">
                            <Pause size={16} />
                        </button>
                    ) : (
                        <button onClick={() => handleAction(account._id, 'resume')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Resume Sending">
                            <Play size={16} />
                        </button>
                    )}

                    <div className="w-px h-4 bg-gray-200 mx-1"></div>

                    <button onClick={() => handleAction(account._id, 'delete')} className="p-2 text-gray-300 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors" title="Delete Account">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6 flex flex-col h-full bg-gray-50/50 animate-in fade-in duration-500 overflow-hidden">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-emerald-500/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <Users size={32} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase font-mono truncate">Origin Accounts</h1>
                        <p className="text-sm text-gray-500 font-medium truncate">Manage sending instances and health status</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-4">
                    <CustomButton
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 border border-indigo-500 h-14 px-6 rounded-2xl flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Users size={20} />
                        <span className="font-bold">Add Account</span>
                    </CustomButton>
                    <CustomButton
                        onClick={() => fetchAccounts()}
                        className="bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-none border border-gray-200 h-14 w-14 p-0 rounded-2xl flex items-center justify-center transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </CustomButton>
                </div>
            </div>

            {/* Neural Data Grid */}
            <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] border border-emerald-500/5 shadow-sm overflow-hidden flex flex-col">
                <Table
                    data={accounts}
                    columns={columns}
                    isLoading={loading}
                    keyExtractor={(acc) => acc._id}
                    emptyMessage="No WhatsApp accounts connected"
                />
            </div>


            {/* Create Account Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6">Add New Account</h2>
                        <form onSubmit={handleCreateAccount} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                <input
                                    type="text"
                                    value={newAccountName}
                                    onChange={(e) => setNewAccountName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    placeholder="e.g. Marketing Number 1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                                <input
                                    type="text"
                                    value={newAccountNumber}
                                    onChange={(e) => setNewAccountNumber(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    placeholder="Used for reference"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SIM Purchase Date</label>
                                <input
                                    type="date"
                                    value={newAccountDate}
                                    onChange={(e) => setNewAccountDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">Date when the SIM/Number was acquired</p>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-4 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-colors"
                                >
                                    Create & Init
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit / Detail Modal */}


            {/* QR Code Modal */}
            {
                isQRModalOpen && selectedAccount && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-gray-100 flex flex-col items-center">
                            <h2 className="text-2xl font-bold mb-2">Scan QR Code</h2>
                            <p className="text-gray-500 text-sm mb-6 text-center">Open WhatsApp on your phone and scan this code to connect {selectedAccount.name}</p>

                            <div className="mb-6 p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                                {selectedAccount.qrCode ? (
                                    <img src={selectedAccount.qrCode} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                                ) : (
                                    <div className="w-64 h-64 flex items-center justify-center text-gray-400">
                                        QR Code Expired or Not Ready
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setIsQRModalOpen(false)}
                                className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )
            }
            {isDeleteModalOpen && (
                <PopupModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setAccountToDelete(null);
                    }}
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this account? This will permanently remove it."
                    type="confirm"
                    onConfirm={confirmDelete}
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                />
            )}
        </div >
    );
};

export default WhatsAppAccounts;
