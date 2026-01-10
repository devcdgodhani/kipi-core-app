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
    Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const WhatsAppSystem: React.FC = () => {
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [queueStatus, setQueueStatus] = useState<any>(null);

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

    const isPaused = queueStatus?.paused > 0 || false; // This is a heuristic, real global pause state isn't in queue counts alone easily

    return (
        <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <Settings size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase font-mono">System Control</h1>
                        <p className="text-sm text-gray-500 font-medium">Global infrastructure management and emergency overrides</p>
                    </div>
                </div>
                <button
                    onClick={fetchStatus}
                    className="relative z-10 bg-white text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm border border-gray-200 h-12 w-12 rounded-xl flex items-center justify-center transition-all active:scale-95"
                >
                    <RefreshCw size={20} className={actionLoading === 'fetch' ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Primary Controls */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Emergency Controls Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Emergency Controls</h2>
                                    <p className="text-sm text-gray-500 font-medium">Instantly pause or resume the entire message processor</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={() => handleAction('pause', whatsappSystemService.pause, 'System paused successfully')}
                                disabled={actionLoading === 'pause'}
                                className="group relative flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed border-rose-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-300 disabled:opacity-50"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                                    <Pause size={32} />
                                </div>
                                <span className="text-lg font-black text-rose-600 uppercase tracking-widest">Pause System</span>
                                <p className="text-xs text-rose-400 font-bold mt-2 text-center px-4">Stop all outgoing message queues immediately</p>
                                {actionLoading === 'pause' && <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-[2rem]"><RefreshCw className="animate-spin text-rose-600" /></div>}
                            </button>

                            <button
                                onClick={() => handleAction('resume', whatsappSystemService.resume, 'System resumed successfully')}
                                disabled={actionLoading === 'resume'}
                                className="group relative flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300 disabled:opacity-50"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                    <Play size={32} />
                                </div>
                                <span className="text-lg font-black text-emerald-600 uppercase tracking-widest">Resume System</span>
                                <p className="text-xs text-emerald-400 font-bold mt-2 text-center px-4">Begin processing messages from waiting queue</p>
                                {actionLoading === 'resume' && <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-[2rem]"><RefreshCw className="animate-spin text-emerald-600" /></div>}
                            </button>
                        </div>
                    </div>

                    {/* Maintenance Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">System Maintenance</h2>
                                    <p className="text-sm text-gray-500 font-medium">Routine maintenance tasks and counter resets</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="bg-amber-50 rounded-[2rem] border border-amber-100 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                                        <RotateCcw size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-amber-900">Reset Message Counters</h3>
                                        <p className="text-sm text-amber-700 leading-relaxed mt-1">
                                            Manually reset daily and hourly send limits for all accounts.
                                            This is usually handled automatically at midnight and on the hour.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAction('resetCounters', whatsappSystemService.resetCounters, 'Counters reset successfully')}
                                    disabled={actionLoading === 'resetCounters'}
                                    className="bg-amber-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-amber-900/10 active:scale-95 whitespace-nowrap disabled:opacity-50"
                                >
                                    {actionLoading === 'resetCounters' ? 'Resetting...' : 'Reset Now'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <button
                                    onClick={() => handleAction('cleanCompleted', () => whatsappSystemService.cleanQueue('completed'), 'Completed jobs cleaned')}
                                    className="flex items-center gap-4 p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all text-left group"
                                >
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
                                        <Trash2 size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-gray-900 uppercase">Clean Completed</div>
                                        <div className="text-xs text-gray-500 font-bold">Remove successfully processed logs</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleAction('retryFailed', whatsappSystemService.retryFailedJobs, 'Failed jobs queued for retry')}
                                    className="flex items-center gap-4 p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all text-left group"
                                >
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                        <RotateCcw size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-gray-900 uppercase">Retry All Failed</div>
                                        <div className="text-xs text-gray-500 font-bold">Process again from failed jobs</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Status & Policy */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Status Tracker */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Activity size={14} /> Processor Status
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <span className="text-sm font-bold text-gray-600">Current State</span>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isPaused ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                    {isPaused ? 'PAUSED' : 'HEALTHY'}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <span>Workload</span>
                                    <span>{(queueStatus?.waiting || 0) + (queueStatus?.active || 0)} Jobs</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, ((queueStatus?.active || 0) / (queueStatus?.waiting || 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Auto-Guard Info Card */}
                    <div className="bg-emerald-900 text-white rounded-[2.5rem] shadow-xl shadow-emerald-900/20 p-8 relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-16 -mr-16 blur-2xl" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                                    <Shield size={20} />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Auto-Guard</h3>
                            </div>
                            <p className="text-sm text-emerald-100/80 leading-relaxed font-medium">
                                The system automatically monitors global risk every 5 minutes.
                            </p>
                            <div className="mt-6 space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                                    <p className="text-xs font-bold text-emerald-50/70">Automatic PAUSE if average risk score &gt; 60</p>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                                    <p className="text-xs font-bold text-emerald-50/70">Automatic RESUME once risk score &lt; 50</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Safety Alert */}
                    <div className="bg-amber-50 rounded-[2.5rem] border border-amber-200 p-8 flex gap-4">
                        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-black text-amber-900 uppercase mb-2">Internal Policy</h4>
                            <p className="text-xs text-amber-700 leading-relaxed font-bold">
                                Manual overrides should only be used during detected anomalies or scheduled maintenance.
                                Pausing the system does not stop currently active message sends but prevents new ones from starting.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppSystem;
