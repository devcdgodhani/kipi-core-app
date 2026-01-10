import React, { useEffect, useState } from 'react';
import { whatsappSystemService } from '../../services/whatsappSystemService';
import { whatsappAccountService } from '../../services/whatsappAccount.service';
import { whatsappRiskService } from '../../services/whatsappRiskService';
import { MessageSquare, AlertCircle, Clock, Users, TrendingUp, MessageCircle } from 'lucide-react';

interface DashboardStats {
    messagesSentToday: number;
    failedMessages: number;
    queueSize: {
        waiting: number;
        active: number;
        delayed: number;
        failed: number;
        completed: number;
        paused: number;
    };
    activeAccounts: number;
    averageRiskScore: number;
    repliesToday: number;
}

const WhatsAppDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchStats = async () => {
        try {
            // Fetch data from multiple endpoints
            const [queueStatusRes, accountsRes, riskAverageRes]: any = await Promise.all([
                whatsappSystemService.getQueueStatus(),
                whatsappAccountService.getAll(),
                whatsappRiskService.getGlobalRiskAverage()
            ]);

            const queueStatus = queueStatusRes.data;
            const accounts = accountsRes.data;
            const riskAverage = riskAverageRes.data;

            // Calculate active accounts
            const activeAccounts = (accounts || []).filter((acc: any) => acc.status === 'ACTIVE').length;

            // Aggregate stats
            const aggregatedStats: DashboardStats = {
                messagesSentToday: 0, // Would need message service endpoint for this
                failedMessages: queueStatus?.failed || 0,
                queueSize: {
                    waiting: queueStatus?.waiting || 0,
                    active: queueStatus?.active || 0,
                    delayed: queueStatus?.delayed || 0,
                    failed: queueStatus?.failed || 0,
                    completed: queueStatus?.completed || 0,
                    paused: queueStatus?.paused || 0,
                },
                activeAccounts,
                averageRiskScore: riskAverage || 0,
                repliesToday: 0, // Would need contact service endpoint for this
            };

            setStats(aggregatedStats);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        if (autoRefresh) {
            const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    // System control methods removed - these endpoints don't exist in new architecture
    // If needed, they should be implemented in WhatsAppSystemController

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6 flex flex-col h-full bg-gray-50/50 animate-in fade-in duration-500 overflow-y-auto">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-emerald-500/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                        <MessageSquare size={32} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase font-mono truncate">WhatsApp Center</h1>
                        <p className="text-sm text-gray-500 font-medium truncate">Real-time messaging infrastructure and risk monitoring</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${autoRefresh ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-500 border border-gray-100'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Clock size={14} /> {autoRefresh ? 'Live' : 'Paused'}
                            </span>
                        </button>
                        <button
                            onClick={fetchStats}
                            className="bg-white text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 shadow-sm border border-gray-200 h-12 w-12 rounded-xl flex items-center justify-center transition-all active:scale-95"
                        >
                            <TrendingUp size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: 'Messages Sent', sub: 'Today', value: stats?.messagesSentToday || 0, icon: MessageSquare, color: 'emerald' },
                    { label: 'Failed Messages', sub: 'Action Required', value: stats?.failedMessages || 0, icon: AlertCircle, color: 'rose' },
                    { label: 'Queue Load', sub: 'Active + Waiting', value: (stats?.queueSize.waiting || 0) + (stats?.queueSize.active || 0), icon: Clock, color: 'amber' },
                    { label: 'Active Accounts', sub: 'Online', value: stats?.activeAccounts || 0, icon: Users, color: 'indigo' },
                    { label: 'Risk Score', sub: 'Global Average', value: stats?.averageRiskScore?.toFixed(1) || '0.0', icon: TrendingUp, color: 'purple' },
                    { label: 'Replies', sub: 'Received Today', value: stats?.repliesToday || 0, icon: MessageCircle, color: 'teal' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-4 bg-${stat.color}-50 rounded-2xl group-hover:bg-${stat.color}-100 transition-colors`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{stat.sub}</span>
                        </div>
                        <div className="text-4xl font-black text-gray-900">{stat.value}</div>
                        <div className="text-sm font-bold text-gray-500 mt-2">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Queue Detailed Status */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-10 w-2 bg-emerald-500 rounded-full" />
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Queue Diagnostics</h2>
                        <p className="text-sm text-gray-500 font-medium">Real-time breakdown of message processing states</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Waiting', value: stats?.queueSize.waiting, color: 'text-gray-600', bg: 'bg-gray-100' },
                        { label: 'Active', value: stats?.queueSize.active, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                        { label: 'Delayed', value: stats?.queueSize.delayed, color: 'text-amber-600', bg: 'bg-amber-100' },
                        { label: 'Failed', value: stats?.queueSize.failed, color: 'text-rose-600', bg: 'bg-rose-100' }
                    ].map((item) => (
                        <div key={item.label} className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className={`mb-2 text-2xl font-black ${item.color}`}>{item.value || 0}</div>
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">{item.label}</div>
                            <div className={`mt-4 h-1.5 w-12 rounded-full ${item.bg}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* System Controls - Temporarily disabled until backend endpoints are implemented */}
            {/* 
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                ... system control buttons ...
            </div>
            */}
        </div>
    );
};


export default WhatsAppDashboard;
