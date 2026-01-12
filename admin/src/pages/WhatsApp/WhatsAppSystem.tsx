
import React, { useState, useEffect } from 'react';
import { whatsappSystemService } from '../../services/whatsappSystemService';
import {
    Play,
    Pause,
    RotateCcw,
    AlertCircle,
    Zap,
    Trash2,
    RefreshCw,
    Activity,
    Settings,
    Shield,
    Database,
    Cpu,
    Radio
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PopupModal } from '../../components/common/PopupModal';

const WhatsAppSystem: React.FC = () => {
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [queueStatus, setQueueStatus] = useState<any>(null);
    const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
    const [purgeType, setPurgeType] = useState<'completed' | 'failed'>('completed');

    const fetchStatus = async () => {
        setActionLoading('fetch');
        try {
            const res: any = await whatsappSystemService.getQueueStatus();
            setQueueStatus(res.data);
        } catch (error) {
            console.error('Error fetching status:', error);
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (action: string, method: () => Promise<any>, successMsg: string) => {
        setActionLoading(action);
        try {
            await method();
            toast.success(successMsg);
            await fetchStatus();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${action}`);
        } finally {
            setActionLoading(null);
        }
    };

    const confirmPurge = async () => {
        if (purgeType === 'completed') {
            await handleAction('cleanCompleted', () => whatsappSystemService.cleanQueue('completed'), 'Completed buffers purged');
        } else {
            // clearQueue clears failed jobs in this service context
            await handleAction('clearQueue', whatsappSystemService.clearQueue, 'Failed buffers purged');
        }
        setIsPurgeModalOpen(false);
    };

    const isPaused = queueStatus?.paused > 0;

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500 overflow-y-auto">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] border border-primary/5 shadow-2xl shadow-gray-200/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -mr-48 -mt-48 blur-[80px] group-hover:bg-indigo-500/10 transition-all duration-1000" />
                <div className="relative z-10 flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 transform group-hover:rotate-12 transition-transform">
                        <Settings size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase font-mono">Control Authority</h1>
                        <p className="text-base text-gray-500 font-medium">Global infrastructure overrides and emergency protocols</p>
                    </div>
                </div>
                <button
                    onClick={fetchStatus}
                    className="relative z-10 bg-white text-gray-400 hover:text-indigo-600 border-2 border-primary/5 h-16 w-16 rounded-[2rem] flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-gray-100/50 hover:bg-indigo-50 hover:border-indigo-100"
                >
                    <RefreshCw size={24} className={actionLoading === 'fetch' ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Protocol Interaction Layer */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Emergency Kill Switches */}
                    <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8">
                            <Zap className="text-rose-100" size={120} />
                        </div>
                        <div className="p-12 border-b border-gray-50 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-rose-50 rounded-3xl text-rose-600 border border-rose-100/50 shadow-sm">
                                    <Radio size={32} className="animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">Emergency Protocol</h2>
                                    <p className="text-sm text-gray-500 font-medium">Global suspension of all transmission nodes</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <button
                                onClick={() => handleAction('pause', whatsappSystemService.pause, 'System authority suspended')}
                                disabled={actionLoading === 'pause'}
                                className="group relative flex flex-col items-center justify-center p-10 rounded-[3rem] border-2 border-dashed border-rose-100 hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-500 disabled:opacity-50"
                            >
                                <div className="w-20 h-20 rounded-3xl bg-rose-500 text-white flex items-center justify-center mb-6 shadow-2xl shadow-rose-500/40 group-hover:scale-110 transition-transform">
                                    <Pause size={40} fill="currentColor" />
                                </div>
                                <span className="text-xl font-black text-rose-600 uppercase tracking-widest">SUSPEND CORE</span>
                                <p className="text-[10px] text-rose-400 font-black mt-4 text-center px-6 uppercase tracking-widest leading-relaxed">Instantly halt all active and waiting transmission queues</p>
                                {actionLoading === 'pause' && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-[3rem]"><RefreshCw className="animate-spin text-rose-600" size={32} /></div>}
                            </button>

                            <button
                                onClick={() => handleAction('resume', whatsappSystemService.resume, 'System authority restored')}
                                disabled={actionLoading === 'resume'}
                                className="group relative flex flex-col items-center justify-center p-10 rounded-[3rem] border-2 border-dashed border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-500 disabled:opacity-50"
                            >
                                <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/40 group-hover:scale-110 transition-transform">
                                    <Play size={40} fill="currentColor" />
                                </div>
                                <span className="text-xl font-black text-emerald-600 uppercase tracking-widest">RESTORE CORE</span>
                                <p className="text-[10px] text-emerald-400 font-black mt-4 text-center px-6 uppercase tracking-widest leading-relaxed">Initiate handshake and resume asynchronous processing</p>
                                {actionLoading === 'resume' && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-[3rem]"><RefreshCw className="animate-spin text-emerald-600" size={32} /></div>}
                            </button>
                        </div>
                    </div>

                    {/* Maintenance Architecture */}
                    <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
                        <div className="p-12 border-b border-gray-50 bg-gray-50/30">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-amber-50 rounded-3xl text-amber-600 border border-amber-100/50">
                                    <Cpu size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">Maintenance Matrix</h2>
                                    <p className="text-sm text-gray-500 font-medium">Hardline resets and memory buffer purges</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-12 space-y-8">
                            <div className="bg-amber-900 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-amber-900/20 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-1000" />
                                <div className="flex gap-8 relative z-10">
                                    <div className="w-20 h-20 rounded-[2rem] bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xl shadow-amber-500/30 group-hover:rotate-12 transition-transform">
                                        <RotateCcw size={40} />
                                    </div>
                                    <div className="pr-12">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Cycle Reset</h3>
                                        <p className="text-sm text-amber-100/60 font-medium leading-relaxed mt-2 max-w-md">
                                            Synchronize all origin terminals and hard-reset transmission counters. Required after emergency maintenance or manual block resolution.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAction('resetCounters', whatsappSystemService.resetCounters, 'Cycle synchronized')}
                                    disabled={actionLoading === 'resetCounters'}
                                    className="bg-white text-gray-900 h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all shadow-xl shadow-black/20 active:scale-95 whitespace-nowrap disabled:opacity-50 relative z-10"
                                >
                                    {actionLoading === 'resetCounters' ? 'HANDSHAKING...' : 'INITIATE SYNC'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <button
                                    onClick={() => { setPurgeType('completed'); setIsPurgeModalOpen(true); }}
                                    className="flex items-center gap-6 p-8 rounded-[2.5rem] border-2 border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-gray-100/50 transition-all duration-500 text-left group"
                                >
                                    <div className="p-5 bg-white text-emerald-500 rounded-3xl group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm border border-gray-100">
                                        <Database size={28} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-gray-900 uppercase tracking-widest">Saturate Buffers</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Purge 200/OK history logs</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleAction('retryFailed', whatsappSystemService.retryFailedJobs, 'Recovery cycle initiated')}
                                    className="flex items-center gap-6 p-8 rounded-[2.5rem] border-2 border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-gray-100/50 transition-all duration-500 text-left group"
                                >
                                    <div className="p-5 bg-white text-indigo-500 rounded-3xl group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm border border-gray-100">
                                        <RotateCcw size={28} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-gray-900 uppercase tracking-widest">Global Retry</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Requeue all fault payloads</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Authority Context Layer */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Real-time Telemetry */}
                    <div className="bg-gray-900 rounded-[3.5rem] shadow-2xl shadow-gray-900/40 p-10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-1000" />

                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                            <Activity size={14} className="text-indigo-400" /> Real-time Telemetry
                        </h3>

                        <div className="space-y-10 relative z-10">
                            <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/10">
                                <span className="text-xs font-bold text-white/60">Core Authority</span>
                                <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${isPaused ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-emerald-500 text-white shadow-emerald-500/20 animate-pulse'}`}>
                                    {isPaused ? 'SUSPENDED' : 'OPERATIONAL'}
                                </span>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/40 px-2">
                                    <span>Core Workload Density</span>
                                    <span className="text-indigo-400">{(queueStatus?.waiting || 0) + (queueStatus?.active || 0)} PAYLOADS</span>
                                </div>
                                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-primary rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (((queueStatus?.active || 0) + (queueStatus?.waiting || 0)) / 1000) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-[9px] text-white/20 font-medium uppercase tracking-tighter text-center">Density based on 1000 payload threshold</p>
                            </div>
                        </div>
                    </div>

                    {/* Security Governance */}
                    <div className="bg-emerald-900/10 border-2 border-emerald-900/20 text-emerald-900 rounded-[3.5rem] p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-900/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-white flex items-center justify-center shadow-xl shadow-emerald-900/20">
                                    <Shield size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight">Governance</h3>
                                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-1">Autonomous Guard active</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-5 items-start">
                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 shadow-lg shadow-emerald-500/40" />
                                    <p className="text-xs font-bold leading-relaxed">Authority automatically suspends if Global Risk Density &gt; 60%</p>
                                </div>
                                <div className="flex gap-5 items-start">
                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 shadow-lg shadow-emerald-500/40" />
                                    <p className="text-xs font-bold leading-relaxed">Authority restores automatically once Global Risk Density &lt; 50%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Directive */}
                    <div className="bg-white rounded-[3rem] border border-gray-100 p-10 flex gap-6 shadow-xl shadow-gray-200/50">
                        <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-3">Operator Directive</h4>
                            <p className="text-[10px] text-gray-400 font-bold leading-loose uppercase tracking-widest">
                                Manual overrides bypass autonomous safety throttles. Proceed with extreme caution during peak traffic windows.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {isPurgeModalOpen && (
                <PopupModal
                    isOpen={isPurgeModalOpen}
                    onClose={() => setIsPurgeModalOpen(false)}
                    title={`PURGE ${purgeType.toUpperCase()} CACHE`}
                    message={`Are you sure you want to permanently erase the ${purgeType} transmission history? This action is recorded in authority logs.`}
                    type="confirm"
                    onConfirm={confirmPurge}
                    confirmLabel="PURGE BUFFER"
                    cancelLabel="ABORT"
                />
            )}
        </div>
    );
};

export default WhatsAppSystem;
