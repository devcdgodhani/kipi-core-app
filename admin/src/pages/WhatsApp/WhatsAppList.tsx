import React, { useEffect, useState } from 'react';
import { whatsappService } from '../../services/whatsapp.service';
import { Plus, Trash2, RefreshCw, LogOut, X, Clock, Eye, MessageSquare, Network } from 'lucide-react';
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
            case 'CONNECTED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'QR_READY': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'CONNECTING': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {error && (
                <div className="fixed top-6 right-6 bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl shadow-rose-200/50 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-sm font-black uppercase tracking-widest">{error}</span>
                </div>
            )}

            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                        <Network size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Neural Bridge</h1>
                        <p className="text-sm text-gray-500 font-medium">Synchronizing enterprise logic with WhatsApp communication nodes</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 flex flex-col items-center">
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest leading-none mb-1">Active Nodes</span>
                        <span className="text-2xl font-black text-primary">{pagination.totalRecords}</span>
                    </div>
                    <CustomButton onClick={() => setShowCreateModal(true)} className="rounded-[1.5rem] shadow-xl shadow-primary/20 h-16 px-8 text-sm uppercase tracking-widest font-black">
                        <Plus size={20} className="mr-2" /> Initialize Node
                    </CustomButton>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sessions.map((session) => (
                    <div key={session._id} className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 flex flex-col overflow-hidden relative">
                        {/* Card Header */}
                        <div className="pt-6 px-6 pb-4 border-b border-gray-50 bg-gradient-to-r from-primary to-primary/90 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <h3 className="font-black text-xl tracking-tight leading-none relative z-10 uppercase font-mono whitespace-nowrap overflow-hidden text-ellipsis">{session.name}</h3>
                            <div className="mt-3 relative z-10">
                                <div className="flex items-center gap-1.5 text-white/50 text-[9px] font-black uppercase tracking-[0.1em] italic leading-none">
                                    <Clock size={10} className="text-white/40" />
                                    <span>
                                        Activity: {session.lastActiveAt ? new Date(session.lastActiveAt).toLocaleString('en-US', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'No record'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card Options (Active, AutoResume) */}
                        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between gap-3">
                            <button
                                onClick={() => toggleIsActive(session)}
                                className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl border-2 transition-all ${session.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${session.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${session.isActive ? 'right-0.5' : 'left-0.5'}`} />
                                </div>
                            </button>
                            <button
                                onClick={() => toggleAutoResume(session)}
                                className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl border-2 transition-all ${session.isAutoResume ? 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest">Resume</span>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${session.isAutoResume ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${session.isAutoResume ? 'right-0.5' : 'left-0.5'}`} />
                                </div>
                            </button>
                        </div>

                        {/* Card Body (QR or Status) */}
                        <div className="p-8 flex-1 flex flex-col items-center justify-center bg-white min-h-[260px] relative">
                            {session.status === 'QR_READY' && session.qrCode ? (
                                <div className="text-center group/qr">
                                    <p className="text-[9px] font-black text-indigo-500 mb-6 px-4 py-1.5 bg-indigo-50 rounded-full inline-block uppercase tracking-widest border border-indigo-100">Wait for Handshake</p>
                                    <button
                                        onClick={() => handleViewQr(session)}
                                        className="relative p-4 bg-white border-2 border-dashed border-indigo-200 rounded-[2rem] shadow-inner group-hover/qr:border-primary/50 transition-all duration-500 group-hover/qr:rotate-2 group-hover/qr:scale-105"
                                    >
                                        <img src={session.qrCode} alt="WhatsApp QR" className="w-32 h-32 object-contain" />
                                        <div className="absolute inset-0 bg-primary/5 rounded-[1.8rem] flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity">
                                            <div className="bg-white p-3 rounded-2xl shadow-2xl">
                                                <Eye className="text-primary" size={24} />
                                            </div>
                                        </div>
                                    </button>
                                    <p className="text-[10px] text-gray-300 mt-6 font-black uppercase tracking-[0.2em]">Enlarge Interface</p>
                                </div>
                            ) : session.status === 'CONNECTED' ? (
                                <div className="text-center py-4">
                                    <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-2 border-emerald-100 shadow-xl shadow-emerald-500/10 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6">
                                        <div className="relative">
                                            <Eye className="text-emerald-500" size={40} />
                                            <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
                                        </div>
                                    </div>
                                    <p className="text-emerald-600 font-black text-sm uppercase tracking-widest">Node Synchronized</p>
                                    <p className="text-[10px] text-gray-300 mt-2 font-bold uppercase tracking-widest italic opacity-60 line-clamp-1 px-4">Operating on secure perimeter</p>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-400 transition-colors">
                                    <div className="relative inline-block mb-6">
                                        <div className={`w-24 h-24 rounded-[2rem] bg-gray-50 flex items-center justify-center border-2 border-gray-100 group-hover:rotate-12 transition-transform duration-500 ${session.status === 'CONNECTING' ? 'border-amber-200 animate-pulse' : ''}`}>
                                            <RefreshCw size={40} className={`${session.status === 'CONNECTING' ? 'animate-spin text-amber-500' : 'text-gray-200'}`} />
                                        </div>
                                        {session.status === 'DISCONNECTED' && (
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-rose-500 rounded-full border-4 border-white shadow-lg"></div>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                        {session.status === 'DISCONNECTED' ? 'Dormant Protocol' : 'Linking Neural Logic...'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Card Footer Actions */}
                        <div className="p-5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between backdrop-blur-sm relative z-10">
                            <div className="flex items-center gap-3">
                                {session.status === 'DISCONNECTED' ? (
                                    <button
                                        onClick={() => handleInitialize(session._id)}
                                        className="py-2.5 px-5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary shadow-xl shadow-gray-200 transition-all active:scale-95 flex items-center gap-2 group/btn"
                                    >
                                        <RefreshCw size={14} className="group-hover/btn:rotate-180 transition-transform duration-500" /> Start Logic
                                    </button>
                                ) : (
                                    <>
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm border ${getStatusColor(session.status)}`}>
                                            {session.status.replace('_', ' ')}
                                        </span>
                                        <button
                                            onClick={() => fetchSessionStatus(session._id)}
                                            disabled={refreshingId === session._id}
                                            className="p-2.5 text-primary bg-white hover:bg-primary/5 rounded-xl transition-all border border-gray-100 shadow-sm active:scale-90 disabled:opacity-50"
                                            title="Sync Node"
                                        >
                                            <RefreshCw size={18} className={refreshingId === session._id ? 'animate-spin' : ''} />
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {session.status !== 'DISCONNECTED' && (
                                    <button
                                        onClick={() => handleLogout(session._id)}
                                        className="p-3 text-amber-600 bg-white hover:bg-amber-50 rounded-xl transition-all border border-amber-100 shadow-sm active:scale-90 group/logout"
                                        title="Detach Protocol"
                                    >
                                        <LogOut size={18} className="group-hover/logout:-translate-x-1 transition-transform" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(session._id)}
                                    className="p-3 text-rose-500 bg-white hover:bg-rose-50 rounded-xl transition-all border border-rose-100 shadow-sm active:scale-90 group/del"
                                    title="Decommission Node"
                                >
                                    <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {sessions.length === 0 && !loading && (
                    <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-gray-50 shadow-xl shadow-gray-100/50 flex flex-col items-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-gray-100">
                            <MessageSquare size={48} className="text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2 font-mono">Vacuum Detected</h3>
                        <p className="text-gray-400 text-sm font-medium">No operational communication nodes discovered in this sector</p>
                        <CustomButton onClick={() => setShowCreateModal(true)} className="mt-10 rounded-2xl px-10 h-16 shadow-2xl shadow-primary/20 uppercase tracking-widest text-[10px] font-black">
                            Establish Initial Node
                        </CustomButton>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="mt-10 flex justify-center items-center gap-6">
                    <button
                        disabled={pagination.page <= 1 || loading}
                        onClick={() => fetchSessions(pagination.page - 1)}
                        className="p-4 bg-white border-2 border-gray-50 rounded-[1.5rem] text-primary disabled:opacity-20 hover:bg-primary hover:text-white transition-all shadow-xl shadow-gray-100/50 active:scale-95 group"
                    >
                        <Network size={22} className="rotate-180 group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Architecture Depth</span>
                        <span className="text-lg font-black text-primary bg-white border-2 border-gray-50 px-6 py-2 rounded-2xl shadow-inner font-mono">
                            {pagination.page} / {pagination.totalPages}
                        </span>
                    </div>
                    <button
                        disabled={pagination.page >= pagination.totalPages || loading}
                        onClick={() => fetchSessions(pagination.page + 1)}
                        className="p-4 bg-white border-2 border-gray-50 rounded-[1.5rem] text-primary disabled:opacity-20 hover:bg-primary hover:text-white transition-all shadow-xl shadow-gray-100/50 active:scale-95 group"
                    >
                        <Network size={22} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-md shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-500 overflow-hidden border border-white/20">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-10 text-white relative">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse" />
                            <div className="flex justify-between items-center relative z-10">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tighter uppercase font-mono">Provision Node</h2>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Initializing WhatsApp Neural Bridge</p>
                                </div>
                                <button onClick={handleCloseModal} className="text-white/40 hover:text-white transition-all p-3 hover:bg-white/10 rounded-2xl border border-white/5 active:scale-90">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleCreateSession} className="p-10 space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 ml-2">Node Specification Identity</label>
                                <input
                                    type="text"
                                    required
                                    value={newSessionName}
                                    onChange={(e) => setNewSessionName(e.target.value)}
                                    className="w-full px-8 py-5 bg-gray-50/50 border-2 border-gray-100 rounded-[2rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus:bg-white outline-none transition-all font-black text-gray-900 placeholder:text-gray-300 text-lg shadow-inner"
                                    placeholder="NODE_BETA_SYNC"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-5 text-gray-400 font-black uppercase tracking-widest hover:text-gray-600 transition-all text-xs active:scale-95"
                                >
                                    Abort
                                </button>
                                <CustomButton fullWidth type="submit" className="rounded-[2rem] py-5 shadow-2xl shadow-primary/30 h-16 text-xs uppercase tracking-[0.2em] font-black">
                                    Finalize Protocol
                                </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR View Modal */}
            {showQrModal && qrSession && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-md shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-500 text-center overflow-hidden border border-white/20">
                        <div className="bg-gradient-to-br from-primary to-indigo-900 p-10 text-white text-left px-12 relative">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                            <div className="flex justify-between items-center relative z-10">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tighter uppercase font-mono">Neural Handshake</h2>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Node: {qrSession.name}</p>
                                </div>
                                <button onClick={handleCloseModal} className="text-white/40 hover:text-white transition-all p-3 hover:bg-white/10 rounded-2xl border border-white/5 active:scale-90">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-10">
                            <div className="relative p-8 bg-white border-4 border-dashed border-primary/10 rounded-[3rem] shadow-inner mb-8 group overflow-hidden">
                                <img src={qrSession.qrCode} alt="WhatsApp QR" className="w-full aspect-square object-contain relative z-10 group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-primary/5 rounded-[2.8rem] pointer-events-none group-hover:bg-transparent transition-all duration-700"></div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mb-8">Scan with WhatsApp to establishing encrypted bridge</p>
                                <button
                                    onClick={handleCloseModal}
                                    className="w-full py-5 bg-gray-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-[2rem] hover:bg-gray-800 transition-all active:scale-95 shadow-2xl shadow-gray-300 h-16"
                                >
                                    Dismiss Logic
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

export default WhatsAppList;
