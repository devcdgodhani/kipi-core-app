import React, { useEffect, useState } from 'react';
import { whatsappSystemService } from '../../services/whatsappSystemService';
import { RefreshCw, Trash2, RotateCcw } from 'lucide-react';
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
            // The response might not have recentFailures, so we'll add an empty array
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
            toast.success('Retrying all failed jobs...');
            fetchStats();
        } catch (error) {
            toast.error('Error retrying jobs');
        }
    };

    const handleClearFailed = async () => {
        setIsClearModalOpen(true);
    };

    const confirmClearFailed = async () => {
        try {
            await whatsappSystemService.clearQueue();
            toast.success('Failed jobs cleared');
            fetchStats();
        } catch (error) {
            toast.error('Error clearing failed jobs');
        } finally {
            setIsClearModalOpen(false);
        }
    };

    if (loading) return <div className="p-6">Loading queue stats...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black uppercase tracking-tight">Message Queue</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchStats()}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Waiting', value: stats?.waiting, color: 'bg-blue-50 text-blue-700' },
                    { label: 'Active', value: stats?.active, color: 'bg-emerald-50 text-emerald-700' },
                    { label: 'Delayed', value: stats?.delayed, color: 'bg-amber-50 text-amber-700' },
                    { label: 'Failed', value: stats?.failed, color: 'bg-rose-50 text-rose-700' },
                    { label: 'Completed', value: stats?.completed, color: 'bg-gray-50 text-gray-700' },
                ].map((stat) => (
                    <div key={stat.label} className={`p-6 rounded-[2rem] border border-transparent ${stat.color}`}>
                        <div className="text-3xl font-black">{stat.value || 0}</div>
                        <div className="text-sm font-medium opacity-80">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Recent Failures */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Recent Failures</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleRetryFailed()}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                            disabled={!stats?.recentFailures.length}
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span className="text-sm font-bold">Retry All</span>
                        </button>
                        <button
                            onClick={handleClearFailed}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                            disabled={!stats?.failed}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm font-bold">Clear Failed</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {stats?.recentFailures.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">No failed jobs</div>
                    ) : (
                        stats?.recentFailures.map((failure) => (
                            <div key={failure.jobId} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-sm font-mono text-gray-500 mb-1">{failure.jobId}</div>
                                        <div className="font-medium text-gray-900">{failure.error}</div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            Failed at: {new Date(failure.failedAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRetryFailed()}
                                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                        title="Retry all failed (includes this job)"
                                    >
                                        <RotateCcw className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {isClearModalOpen && (
                <PopupModal
                    isOpen={isClearModalOpen}
                    onClose={() => setIsClearModalOpen(false)}
                    title="Clear Failed Jobs"
                    message="Are you sure you want to clear all failed jobs?"
                    type="confirm"
                    onConfirm={confirmClearFailed}
                    confirmLabel="Clear"
                    cancelLabel="Cancel"
                />
            )}
        </div>
    );
};

export default WhatsAppQueue;
