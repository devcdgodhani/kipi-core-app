
import React, { useEffect, useState } from 'react';
import { whatsappSystemService } from '../../services/whatsappSystemService';
import { RefreshCw, Trash2, RotateCcw, LayoutGrid, Clock, AlertCircle, CheckCircle2, PauseCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PopupModal } from '../../components/common/PopupModal';

interface QueueStats {
    waiting: number;
    active: number;
    delayed: number;
    failed: number;
    completed: number;
    paused: number;
    recentFailures: Array<{
        jobId: string;
        error: string;
        failedAt: string;
    }>;
}

const WhatsAppQueue: React.FC = () => {
    const [stats, setStats] = useState<QueueStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    const fetchStats = async () => {
        try {
            const response: any = await whatsappSystemService.getQueueStatus();
            setStats({
                ...response.data,
                recentFailures: response.data.recentFailures || []
            });
        } catch (error) {
            console.error('Error fetching queue stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleRetryFailed = async () => {
        try {
            await whatsappSystemService.retryFailedJobs();
            toast.success('Initiating recovery for failed payloads...');
            fetchStats();
        } catch (error) {
            toast.error('Recovery sequence failed');
        }
    };

    const handleClearFailed = async () => {
        setIsClearModalOpen(true);
    };

    const confirmClearFailed = async () => {
        try {
            await whatsappSystemService.clearQueue();
            toast.success('Failed memory buffers cleared');
            fetchStats();
        } catch (error) {
            toast.error('Error purging buffers');
        } finally {
            setIsClearModalOpen(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">Syncing with Relay Server...</div>;

    const statTiles = [
        { label: 'Waiting', value: stats?.waiting, icon: Clock, color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
        { label: 'Processing', value: stats?.active, icon: RefreshCw, color: 'text-emerald-500 bg-emerald-50 border-emerald-100', animate: true },
        { label: 'Delayed', value: stats?.delayed, icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-100' },
        { label: 'Critical Errors', value: stats?.failed, icon: AlertCircle, color: 'text-rose-500 bg-rose-50 border-rose-100' },
        { label: 'Purged/Paused', value: stats?.paused, icon: PauseCircle, color: 'text-gray-400 bg-gray-50 border-gray-100' },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gray-900 flex items-center justify-center text-white shadow-xl shadow-gray-200">
                        <LayoutGrid size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Transmission Queue</h1>
                        <p className="text-sm text-gray-500 font-medium">Asynchronous relay management and job telemetry</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-4">
                    <button
                        onClick={() => fetchStats()}
                        className="bg-white text-gray-400 hover:text-primary border-2 border-primary/5 h-14 w-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-gray-100/50"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Neural Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                {statTiles.map((stat) => (
                    <div key={stat.label} className={`p-8 rounded-[2.5rem] border transition-all hover:shadow-xl hover:shadow-gray-100/50 relative overflow-hidden group ${stat.color}`}>
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <stat.icon size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <stat.icon size={16} className={stat.animate ? 'animate-spin-slow' : ''} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{stat.label}</span>
                            </div>
                            <div className="text-4xl font-black tracking-tighter">{stat.value || 0}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Failures List */}
                <div className="xl:col-span-2 bg-white rounded-[3rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Transmission Faults</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Active failure logs requiring attention</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleRetryFailed}
                                className="px-6 h-12 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-200"
                                disabled={!stats?.recentFailures.length}
                            >
                                <RotateCcw size={16} />
                                Recovery Sequence
                            </button>
                            <button
                                onClick={handleClearFailed}
                                className="px-6 h-12 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 border border-rose-100"
                                disabled={!stats?.failed}
                            >
                                <Trash2 size={16} />
                                Purge Cache
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {stats?.recentFailures && stats.recentFailures.length > 0 ? (
                            stats.recentFailures.map((failure) => (
                                <div key={failure.jobId} className="group p-6 rounded-3xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-gray-100/50 transition-all">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-rose-500 shadow-sm mt-1">
                                                <AlertCircle size={20} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                    Job ID: <span className="text-gray-600">{failure.jobId}</span>
                                                </div>
                                                <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{failure.error}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-2 flex items-center gap-2">
                                                    <Clock size={12} />
                                                    {new Date(failure.failedAt).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRetryFailed}
                                            className="p-3 bg-white border border-gray-100 text-indigo-500 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                            title="Retry Payload"
                                        >
                                            <RotateCcw size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={40} />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 uppercase tracking-tight">System Fully Synchronized</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">No active transmission faults recorded in current cycle</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info / Secondary Pane */}
                <div className="space-y-8">
                    <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-1000" />
                        <div className="relative z-10">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-4">Relay Uptime</h3>
                            <div className="text-5xl font-black tracking-tighter mb-2">99.9%</div>
                            <p className="text-sm font-medium text-white/70">Continuous transmission active without service interruptions</p>

                            <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold opacity-60 uppercase">Completed Jobs</span>
                                    <span className="font-black">{stats?.completed || 0}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white transition-all duration-1000" style={{ width: '100%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                                <Clock size={18} />
                            </div>
                            <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">Cron Schedule</h3>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            Transmission buffers are automatically scrubbed every 15 minutes. Delayed payloads are requeued based on their exponential backoff configuration.
                        </p>
                    </div>
                </div>
            </div>

            {isClearModalOpen && (
                <PopupModal
                    isOpen={isClearModalOpen}
                    onClose={() => setIsClearModalOpen(false)}
                    title="Purge Memory Buffer"
                    message="Are you sure you want to permanently erase the failure history? This action cannot be reversed."
                    type="confirm"
                    onConfirm={confirmClearFailed}
                    confirmLabel="Purge Buffer"
                    cancelLabel="Cancel"
                />
            )}
        </div>
    );
};

export default WhatsAppQueue;
