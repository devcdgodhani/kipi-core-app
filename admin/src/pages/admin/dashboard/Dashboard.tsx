import {
    Users,
    Activity,
    Zap,
    ShieldCheck,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

const Dashboard = () => {
    const stats = [
        { label: 'Active Nodes', value: '1,284', change: '+12.5%', icon: Users, color: 'bg-emerald-500', trend: 'up' },
        { label: 'System Load', value: '24.8%', change: '-2.4%', icon: Activity, color: 'bg-brand-500', trend: 'down' },
        { label: 'Security Score', value: '99.9%', change: '+0.1%', icon: ShieldCheck, color: 'bg-indigo-500', trend: 'up' },
        { label: 'Compute Power', value: '4.2 TH/s', change: '+8.2%', icon: Zap, color: 'bg-amber-500', trend: 'up' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Page Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-text-primary tracking-tight italic uppercase">
                        Nexus <span className="text-brand-500 italic">Overview</span>
                    </h1>
                    <p className="text-text-secondary text-sm font-bold uppercase tracking-widest mt-1">Real-time system telemetry</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20">
                        Export Data Log
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-surface backdrop-blur-3xl border border-border p-6 rounded-[32px] group hover:border-text-secondary/20 transition-all duration-500 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color}/10 rounded-full blur-3xl -mr-8 -mt-8`} />

                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.color}/10 rounded-2xl flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-3xl font-black text-text-primary tracking-tight">{stat.value}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Secondary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-surface backdrop-blur-3xl border border-border rounded-[40px] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-text-primary tracking-tight uppercase italic">Recent <span className="text-brand-500 italic">Pulses</span></h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mt-1">Global audit trail</p>
                        </div>
                        <TrendingUp className="text-text-secondary w-5 h-5" />
                    </div>

                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="flex items-center justify-between group p-3 hover:bg-surface-hover rounded-2xl transition-all cursor-crosshair">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-surface-hover rounded-xl flex items-center justify-center">
                                        <Activity className="w-5 h-5 text-text-secondary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-text-primary uppercase tracking-tight">Access Protocol Alpha</h4>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Node ID: AX-400{i} • Verified</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">04:22:90 MST</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Alarms */}
                <div className="bg-surface backdrop-blur-3xl border border-border rounded-[40px] p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-text-primary tracking-tight uppercase italic">Crit <span className="text-red-500 italic">Alerts</span></h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mt-1">Threat detection</p>
                        </div>
                        <AlertCircle className="text-red-500 w-5 h-5 animate-pulse" />
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-red-500/5 rounded-[32px] border border-red-500/10 mb-6">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8 text-red-500" />
                        </div>
                        <h4 className="text-lg font-black text-text-primary uppercase tracking-tight">Zero Threats</h4>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-2 px-4 leading-relaxed">System integrity verified. No critical overrides detected in current session.</p>
                    </div>

                    <button className="w-full py-4 bg-surface-hover text-text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest border border-border hover:bg-surface-hover/80 transition-all">
                        Full Security Scan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
