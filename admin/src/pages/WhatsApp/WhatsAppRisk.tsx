
import React, { useEffect, useState } from 'react';
import { whatsappRiskService, type IWhatsAppRiskEvent } from '../../services/whatsappRiskService';
import { RefreshCw, ShieldAlert, Activity, AlertTriangle, AlertCircle, TrendingDown, Clock, ShieldCheck, Filter, RotateCcw } from 'lucide-react';

const WhatsAppRisk: React.FC = () => {
    const [events, setEvents] = useState<IWhatsAppRiskEvent[]>([]);
    const [breakdown, setBreakdown] = useState<any>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventsRes, breakdownRes]: any = await Promise.all([
                whatsappRiskService.getRecentRiskEvents(),
                whatsappRiskService.getRiskBreakdown()
            ]);
            setEvents(eventsRes.data || []);
            setBreakdown(breakdownRes.data || []);
        } catch (error) {
            console.error('Error fetching risk data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getEventStyles = (type: string) => {
        switch (type) {
            case 'USER_REPORT': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: AlertCircle };
            case 'USER_BLOCK': return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: ShieldAlert };
            case 'NO_REPLY': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock };
            case 'FAST_SEND': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Activity };
            case 'REPLY_RECEIVED': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: ShieldCheck };
            case 'SEND_FAILURE': return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: AlertTriangle };
            case 'AUTH_FAILURE': return { color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100', icon: Activity };
            case 'DISCONNECTED_BANNED': return { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', icon: ShieldAlert };
            case 'STOP_REQUEST': return { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: AlertCircle };
            default: return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', icon: Activity };
        }
    };

    if (loading && events.length === 0) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Scanning Risk Matrix...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-rose-500/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/20">
                        <ShieldAlert size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Risk Sentinel</h1>
                        <p className="text-sm text-gray-500 font-medium">Monitoring account health and anti-ban heuristics</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-4">
                    <button
                        onClick={fetchData}
                        className="bg-white text-gray-400 hover:text-primary border-2 border-primary/5 h-14 w-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-gray-100/50"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Neural Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(breakdown || []).map((item: any, i: number) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 text-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrendingDown size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{item._id}</div>
                            <div className="flex items-end justify-between">
                                <div className="text-4xl font-black text-gray-900 tracking-tighter">{item.count}</div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${item.totalPoints > 50 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                    {item.totalPoints > 0 ? '+' : ''}{item.totalPoints} POINTS
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* High-Fidelity Event Log */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100 p-10 relative overflow-hidden">
                <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Event Telemetry</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Real-time heuristics and trigger logs</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="px-6 py-2 bg-gray-50 text-gray-400 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Filter size={14} /> Neural Filters
                        </div>
                        <button onClick={fetchData} className="p-2 text-gray-400 hover:text-primary transition-colors">
                            <RotateCcw size={20} />
                        </button>
                    </div>
                </div>

                <div className="space-y-4 relative z-10">
                    {(events || []).map((event) => {
                        const styles = getEventStyles(event.eventType);
                        return (
                            <div key={event._id} className={`group flex items-start p-6 rounded-[2rem] border-2 transition-all hover:bg-white hover:shadow-2xl hover:shadow-gray-100/50 ${styles.bg} ${styles.border} border-opacity-40 hover:border-opacity-100 hover:scale-[1.01] duration-300`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-6 shadow-sm border ${styles.bg} ${styles.border} ${styles.color}`}>
                                    <styles.icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`text-sm font-black uppercase tracking-wider ${styles.color}`}>{event.eventType.replace('_', ' ')}</span>
                                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            {new Date(event.timestamp).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                        Instance: <span className="font-mono text-gray-900 bg-white/60 px-2 py-0.5 rounded border border-gray-100 overflow-hidden truncate max-w-[200px]">
                                            {(event.accountId as any)?.number || (event.accountId as any)?.name || 'ANONYMOUS_PROCESS'}
                                        </span>
                                    </div>
                                    {event.metadata?.error && (
                                        <div className="mt-3 text-[10px] bg-black/5 p-3 rounded-xl font-mono text-gray-600 border border-black/5 break-all max-w-full italic">
                                            PAYLOAD_ERROR: {event.metadata.error}
                                        </div>
                                    )}
                                </div>
                                <div className="ml-6 text-right">
                                    <div className={`text-2xl font-black tracking-tighter ${event.points > 20 ? 'text-rose-500' : 'text-gray-400'}`}>
                                        {event.points > 0 ? '+' : ''}{event.points}
                                    </div>
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">LOAD_PTS</div>
                                </div>
                            </div>
                        );
                    })}
                    {(events || []).length === 0 && (
                        <div className="text-center py-24 flex flex-col items-center justify-center space-y-4">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                                <ShieldCheck size={40} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase">Operational Integrity High</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">No critical risk anomalies recorded in current lookback window</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WhatsAppRisk;
