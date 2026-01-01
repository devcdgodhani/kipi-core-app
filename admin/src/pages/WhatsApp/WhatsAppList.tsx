import React, { useEffect, useState } from 'react';
import { whatsappService } from '../../services/whatsapp.service';
import { Plus, Trash2, RefreshCw, LogOut, AlertTriangle, X, Clock, Eye } from 'lucide-react';
import CustomButton from '../../components/common/Button';
import { PopupModal } from '../../components/common/PopupModal';

interface Session {
    _id: string;
    name: string;
    status: string;
    qrCode?: string;
    lastActiveAt?: number;
    isAutoResume: boolean;
    isActive: boolean;
}

const WhatsAppList: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newSessionName, setNewSessionName] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrSession, setQrSession] = useState<Session | null>(null);
    const [refreshingId, setRefreshingId] = useState<string | null>(null);
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
        onConfirm: () => { },
    });

    // Pagination state
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalRecords: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchSessions();
    }, [pagination.page]);

    const fetchSessions = async (page = 1, silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await whatsappService.getWithPagination({
                page,
                limit: pagination.limit,
                isPaginate: true
            });

            if (response && response.data) {
                setSessions(response.data.recordList || []);
                setPagination(prev => ({
                    ...prev,
                    page: response.data.currentPage,
                    totalRecords: response.data.totalRecords,
                    totalPages: response.data.totalPages
                }));
            }
        } catch (err: any) {
            console.error('Fetch sessions error:', err);
            if (!silent) setError(err.response?.data?.message || 'Failed to fetch sessions');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await whatsappService.createSession({ name: newSessionName });
            if (response && response.data) {
                setNewSessionName('');
                handleCloseModal();
            }
        } catch (err: any) {
            setPopup({
                isOpen: true,
                title: 'Provision Error',
                message: err.response?.data?.message || 'Failed to create session architecture.',
                type: 'alert',
                onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setShowQrModal(false);
        setQrSession(null);
        setNewSessionName('');
        fetchSessions();
    };

    const handleViewQr = (session: Session) => {
        setQrSession(session);
        setShowQrModal(true);
    };

    const fetchSessionStatus = async (id: string) => {
        try {
            setRefreshingId(id);
            const response = await whatsappService.getSession(id);
            if (response && response.data) {
                const updatedSession = response.data;
                setSessions(prev => prev.map(s => s._id === id ? updatedSession : s));
            }
        } catch (err) {
            console.error('Refresh status error:', err);
        } finally {
            setRefreshingId(null);
        }
    };

    const toggleAutoResume = async (session: Session) => {
        try {
            await whatsappService.updateSession(session._id, { isAutoResume: !session.isAutoResume });
            setSessions(prev => prev.map(s => s._id === session._id ? { ...s, isAutoResume: !s.isAutoResume } : s));
        } catch (err) {
            console.error('Toggle AutoResume error:', err);
        }
    };

    const toggleIsActive = async (session: Session) => {
        try {
            await whatsappService.updateSession(session._id, { isActive: !session.isActive });
            setSessions(prev => prev.map(s => s._id === session._id ? { ...s, isActive: !s.isActive } : s));
        } catch (err) {
            console.error('Toggle IsActive error:', err);
        }
    };

    const handleDelete = async (id: string) => {
        setPopup({
            isOpen: true,
            title: 'Terminate Session',
            message: 'Are you sure you want to terminate this operational node? This action cannot be reversed.',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await whatsappService.deleteSession(id);
                    fetchSessions();
                    setPopup(prev => ({ ...prev, isOpen: false, loading: false }));
                } catch (err: any) {
                    setPopup({
                        isOpen: true,
                        title: 'Termination Error',
                        message: err.response?.data?.message || 'Internal failure during session disposal.',
                        type: 'alert',
                        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const handleLogout = async (id: string) => {
        setPopup({
            isOpen: true,
            title: 'Session Disconnection',
            message: 'Initiate session logout protocol?',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await whatsappService.logoutSession(id);
                    fetchSessions();
                    setPopup(prev => ({ ...prev, isOpen: false, loading: false }));
                } catch (err: any) {
                    setPopup({
                        isOpen: true,
                        title: 'Disconnection Fault',
                        message: err.response?.data?.message || 'Failed to transmit logout signal.',
                        type: 'alert',
                        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const handleInitialize = async (id: string) => {
        try {
            await whatsappService.initializeSession(id);
            fetchSessions();
        } catch (err: any) {
            setPopup({
                isOpen: true,
                title: 'Initialization Failed',
                message: err.response?.data?.message || 'Could not establish connection with WhatsApp servers.',
                type: 'alert',
                onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONNECTED': return 'bg-green-100 text-green-800';
            case 'QR_READY': return 'bg-blue-100 text-blue-800';
            case 'CONNECTING': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">WhatsApp Sessions</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage and monitor your WhatsApp web connections</p>
                </div>
                <CustomButton onClick={() => setShowCreateModal(true)} className="rounded-xl shadow-lg shadow-primary/20">
                    <Plus size={18} className="mr-2" /> Add New Session
                </CustomButton>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                    <AlertTriangle size={18} />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sessions.map((session) => (
                    <div key={session._id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col overflow-hidden">
                        {/* Card Header with Table Header Theme */}
                        <div className="pt-5 px-5 pb-3 border-b border-primary/10 bg-primary text-white">
                            <h3 className="font-bold text-xl tracking-tight leading-none">{session.name}</h3>
                            <div className="mt-2.5">
                                <div className="flex items-center gap-1.5 text-white/60 text-[10px] font-medium lowercase italic leading-none">
                                    <Clock size={10} className="text-white/40" />
                                    <span>
                                        last active: {session.lastActiveAt ? new Date(session.lastActiveAt).toLocaleString('en-US', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'no history'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card Options (Active, AutoResume) */}
                        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between gap-4">
                            <button
                                onClick={() => toggleIsActive(session)}
                                className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${session.isActive ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${session.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${session.isActive ? 'right-0.5' : 'left-0.5'}`} />
                                </div>
                            </button>
                            <button
                                onClick={() => toggleAutoResume(session)}
                                className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${session.isAutoResume ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">Auto-Resume</span>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${session.isAutoResume ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${session.isAutoResume ? 'right-0.5' : 'left-0.5'}`} />
                                </div>
                            </button>
                        </div>

                        {/* Card Body (QR or Status) */}
                        <div className="p-8 flex-1 flex flex-col items-center justify-center bg-white min-h-[240px]">
                            {session.status === 'QR_READY' && session.qrCode ? (
                                <div className="text-center">
                                    <p className="text-xs font-semibold text-gray-500 mb-4 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full inline-block">Wait for Scan</p>
                                    <button
                                        onClick={() => handleViewQr(session)}
                                        className="relative p-3 bg-white border-2 border-dashed border-blue-200 rounded-2xl shadow-inner group-hover:border-primary/50 transition-colors"
                                    >
                                        <img src={session.qrCode} alt="WhatsApp QR" className="w-40 h-40 object-contain" />
                                        <div className="absolute inset-0 bg-blue-500/5 rounded-2xl flex items-center justify-center ">
                                            <div className="bg-white/90 p-2 rounded-lg shadow-sm">
                                                <Eye className="text-primary" size={24} />
                                            </div>
                                        </div>
                                    </button>
                                    <p className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest">Click to enlarge</p>
                                </div>
                            ) : session.status === 'CONNECTED' ? (
                                <div className="text-center py-4">
                                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100 shadow-sm group-hover:scale-110 transition-transform">
                                        <Eye className="text-green-500" size={36} />
                                    </div>
                                    <p className="text-green-600 font-bold text-sm">Session Connected</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Operational & Ready</p>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-400 group-hover:text-gray-500 transition-colors">
                                    <div className="relative inline-block mb-4">
                                        <RefreshCw size={48} className={`mx-auto ${session.status === 'CONNECTING' ? 'animate-spin text-primary' : 'text-gray-200'}`} />
                                        {session.status === 'DISCONNECTED' && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>
                                    <p className="text-xs font-medium uppercase tracking-widest">
                                        {session.status === 'DISCONNECTED' ? 'Ready to Start' : 'Connecting...'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Card Footer Actions */}
                        <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                {session.status === 'DISCONNECTED' ? (
                                    <button
                                        onClick={() => handleInitialize(session._id)}
                                        className="py-2 px-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 shadow-md shadow-primary/20 transition-all active:scale-[0.98] flex items-center gap-2"
                                    >
                                        <RefreshCw size={14} /> Initialize
                                    </button>
                                ) : (
                                    <>
                                        <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(session.status)} shadow-sm ring-1 ring-black/5`}>
                                            {session.status.replace('_', ' ')}
                                        </span>
                                        <button
                                            onClick={() => fetchSessionStatus(session._id)}
                                            disabled={refreshingId === session._id}
                                            className="p-2 text-primary bg-white hover:bg-blue-50 rounded-xl transition-all border border-blue-50 shadow-sm active:scale-90 disabled:opacity-50"
                                            title="Refresh Status"
                                        >
                                            <RefreshCw size={16} className={refreshingId === session._id ? 'animate-spin' : ''} />
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {session.status !== 'DISCONNECTED' && (
                                    <button
                                        onClick={() => handleLogout(session._id)}
                                        className="p-2.5 text-orange-600 bg-white hover:bg-orange-50 rounded-xl transition-all border border-orange-100 shadow-sm active:scale-90"
                                        title="Logout Session"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(session._id)}
                                    className="p-2.5 text-red-500 bg-white hover:bg-red-50 rounded-xl transition-all border border-red-100 shadow-sm active:scale-90"
                                    title="Delete Session"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {sessions.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                        <MessageSquare size={48} className="mx-auto text-gray-200 mb-3" />
                        <h3 className="text-lg font-bold text-gray-900">No sessions found</h3>
                        <p className="text-gray-500 text-sm">Create your first WhatsApp session to start.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                    <button
                        disabled={pagination.page <= 1 || loading}
                        onClick={() => fetchSessions(pagination.page - 1)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-gray-50 shadow-sm"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                        {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                        disabled={pagination.page >= pagination.totalPages || loading}
                        onClick={() => fetchSessions(pagination.page + 1)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-gray-50 shadow-sm"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="bg-primary p-8 text-white">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tighter uppercase font-mono">Setup Node</h2>
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Initialize WhatsApp Bridge</p>
                                </div>
                                <button onClick={handleCloseModal} className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleCreateSession} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Session Identity</label>
                                <input
                                    type="text"
                                    required
                                    value={newSessionName}
                                    onChange={(e) => setNewSessionName(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                    placeholder="e.g. CORE_SERVICE"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-3.5 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all active:scale-95"
                                >
                                    Discard
                                </button>
                                <CustomButton fullWidth type="submit" className="rounded-2xl py-3.5 shadow-lg shadow-primary/20">
                                    Create Session
                                </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR View Modal */}
            {showQrModal && qrSession && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center overflow-hidden">
                        <div className="bg-primary p-6 text-white text-left px-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-black tracking-tighter uppercase font-mono">Session QR</h2>
                                    <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mt-0.5">{qrSession.name}</p>
                                </div>
                                <button onClick={handleCloseModal} className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="relative p-6 bg-white border-4 border-dashed border-primary/10 rounded-[2.5rem] shadow-inner mb-6 group">
                                <img src={qrSession.qrCode} alt="WhatsApp QR" className="w-full aspect-square object-contain" />
                                <div className="absolute inset-0 bg-primary/5 rounded-[2.2rem] pointer-events-none group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="space-y-4">
                                <button
                                    onClick={handleCloseModal}
                                    className="w-full py-4 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

// Simple icon mapping
const MessageSquare = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

export default WhatsAppList;
