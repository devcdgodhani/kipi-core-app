
import React, { useEffect, useState } from 'react';
import { whatsappSystemService } from '../../services/whatsappSystemService';
import { whatsappAccountService } from '../../services/whatsappAccount.service';
import { whatsappRiskService } from '../../services/whatsappRiskService';
import { MessageSquare, AlertCircle, Clock, Users, TrendingUp, MessageCircle, RefreshCw, Zap, ShieldCheck, Activity } from 'lucide-react';

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
            const [queueStatusRes, accountsRes, riskAverageRes]: any = await Promise.all([
                whatsappSystemService.getQueueStatus(),
                whatsappAccountService.getAll(),
                whatsappRiskService.getGlobalRiskAverage()
            ]);

            const queueStatus = queueStatusRes.data;
            const accounts = accountsRes.data;
            const riskAverage = riskAverageRes.data;

            const activeAccounts = (accounts || []).filter((acc: any) => acc.status === 'ACTIVE').length;

            const aggregatedStats: DashboardStats = {
                messagesSentToday: 0,
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
                repliesToday: 0,
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
            const interval = setInterval(fetchStats, 30000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    if (loading && !stats) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Synchronizing Hub...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        { label: 'Transmission Volume', sub: 'Today (Est)', value: stats?.messagesSentToday || 0, icon: MessageSquare, color: 'emerald', trend: '+12%' },
        { label: 'Critical Faults', sub: 'Immediate Action', value: stats?.failedMessages || 0, icon: AlertCircle, color: 'rose', trend: '-5%' },
        { label: 'Network Load', sub: 'Queue Backlog', value: (stats?.queueSize.waiting || 0) + (stats?.queueSize.active || 0), icon: Clock, color: 'amber', trend: 'Steady' },
        { label: 'Active Terminals', sub: 'Live Origin Nodes', value: stats?.activeAccounts || 0, icon: Users, color: 'indigo', trend: 'Online' },
        { label: 'Risk Integrity', sub: 'Global Multiplier', value: stats?.averageRiskScore?.toFixed(1) || '0.0', icon: ShieldCheck, color: 'purple', trend: 'Safe' },
        { label: 'Inbound Flow', sub: 'Consumer Replies', value: stats?.repliesToday || 0, icon: MessageCircle, color: 'teal', trend: '+3%' }
    ];

    const colorMap: any = {
        emerald: 'bg-emerald-50 text-emerald-500 border-emerald-100/50',
        rose: 'bg-rose-50 text-rose-500 border-rose-100/50',
        amber: 'bg-amber-50 text-amber-500 border-amber-100/50',
        indigo: 'bg-indigo-50 text-indigo-500 border-indigo-100/50',
        purple: 'bg-purple-50 text-purple-500 border-purple-100/50',
        teal: 'bg-teal-50 text-teal-500 border-teal-100/50'
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700 h-full overflow-y-auto custom-scrollbar">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] border border-primary/5 shadow-2xl shadow-gray-200/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-full -mr-64 -mt-64 blur-[100px] group-hover:bg-primary/10 transition-all duration-1000" />
                <div className="relative z-10 flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-primary/20 transform group-hover:rotate-6 transition-transform">
                        <Zap size={40} fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-primary tracking-tighter uppercase font-mono">WhatsApp Nexus</h1>
                        <p className="text-base text-gray-500 font-medium">Global communication infrastructure and real-time risk matrix</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`h-16 px-8 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 border-2 ${autoRefresh
                                ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20'
                                : 'bg-white text-gray-400 border-primary/5 hover:border-primary/20'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
                        {autoRefresh ? 'Live Sync' : 'Standby'}
                    </button>
                    <button
                        onClick={fetchStats}
                        className="bg-white text-gray-400 hover:text-primary border-2 border-primary/5 h-16 w-16 rounded-[2rem] flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-gray-100/50 hover:shadow-primary/5 hover:bg-primary/5"
                    >
                        <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Neural Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/80 transition-all duration-500 group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${colorMap[stat.color].split(' ')[0]} rounded-full -mr-16 -mt-16 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className={`p-5 rounded-2xl border ${colorMap[stat.color]} transition-all group-hover:scale-110 duration-500 shadow-sm`}>
                                <stat.icon size={28} />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">{stat.sub}</span>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : stat.trend.startsWith('-') ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-500'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="text-5xl font-black text-gray-900 tracking-tighter mb-2">{stat.value}</div>
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Queue Diagnostics */}
                <div className="lg:col-span-2 bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/30 rounded-full -mr-48 -mt-48 blur-[80px]" />

                    <div className="relative z-10 flex items-center justify-between mb-12">
                        <div className="flex items-center gap-6">
                            <div className="w-[4px] h-12 bg-primary rounded-full shadow-lg shadow-primary/20" />
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">Queue Diagnostics</h2>
                                <p className="text-sm text-gray-500 font-medium">Real-time breakdown of message processing lifecycle</p>
                            </div>
                        </div>
                        <div className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                            {(stats?.queueSize.completed || 0)} Payloads Processed Today
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                        {[
                            { label: 'Waiting', value: stats?.queueSize.waiting, color: 'text-gray-400', bar: 'bg-gray-200', icon: Clock },
                            { label: 'Active', value: stats?.queueSize.active, color: 'text-emerald-500', bar: 'bg-emerald-500', icon: Activity, animate: true },
                            { label: 'Delayed', value: stats?.queueSize.delayed, color: 'text-amber-500', bar: 'bg-amber-500', icon: Clock },
                            { label: 'Failed', value: stats?.queueSize.failed, color: 'text-rose-500', bar: 'bg-rose-500', icon: AlertCircle }
                        ].map((item) => (
                            <div key={item.label} className="p-8 rounded-[2.5rem] bg-gray-50/50 border border-transparent hover:bg-white hover:border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 flex flex-col items-center text-center transition-all duration-500 group">
                                <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${item.color}`}>
                                    <item.icon size={20} className={item.animate ? 'animate-spin-slow' : ''} />
                                </div>
                                <div className={`text-4xl font-black ${item.color} tracking-tighter mb-2`}>{item.value || 0}</div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{item.label}</div>
                                <div className={`mt-6 h-1 w-12 rounded-full ${item.bar} opacity-20 group-hover:opacity-100 transition-opacity`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Integrity */}
                <div className="bg-gray-900 rounded-[3.5rem] p-12 text-white shadow-2xl shadow-gray-900/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/30 transition-all duration-1000" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <ShieldCheck size={28} className="text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Core Integrity</h3>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Uptime: 99.98%</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Risk Threshold</span>
                                    <span className="text-xs font-black text-emerald-400">OPTIMAL</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.max(10, 100 - (stats?.averageRiskScore || 0))}%` }} />
                                </div>
                                <p className="text-[9px] text-white/30 font-medium mt-3 uppercase tracking-tighter text-center">Auto-pause triggers at 60% risk density</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                                    <div className="text-2xl font-black text-white">{stats?.activeAccounts || 0}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">Bound Nodes</div>
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                                    <div className="text-2xl font-black text-white">4ms</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">Relay Latency</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 bg-primary/10 border border-primary/20 rounded-3xl p-6">
                            <button className="w-full flex items-center justify-between group/btn">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">System Overrides</span>
                                <TrendingUp size={16} className="text-primary group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppDashboard;
