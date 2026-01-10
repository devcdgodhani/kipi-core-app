import React, { useEffect, useState } from 'react';
import { whatsappRiskService, type IWhatsAppRiskEvent } from '../../services/whatsappRiskService';
import { RefreshCw } from 'lucide-react';

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

    const getEventColor = (type: string) => {
        switch (type) {
            case 'USER_REPORT': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'USER_BLOCK': return 'text-orange-600 bg-orange-50 border-orange-100';
            case 'NO_REPLY': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'FAST_SEND': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'REPLY_RECEIVED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'SEND_FAILURE': return 'text-red-600 bg-red-50 border-red-100';
            case 'AUTH_FAILURE': return 'text-pink-600 bg-pink-50 border-pink-100';
            case 'DISCONNECTED_BANNED': return 'text-purple-600 bg-purple-50 border-purple-100';
            case 'STOP_REQUEST': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    if (loading) return <div className="p-6">Loading risk data...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black uppercase tracking-tight">Risk Monitoring</h1>
                <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-full">
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Risk Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(breakdown || []).map((item: any) => (
                    <div key={item._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="text-sm font-bold text-gray-500 mb-1">{item._id}</div>
                        <div className="flex items-end justify-between">
                            <div className="text-3xl font-black">{item.count}</div>
                            <div className={`text-sm font-bold ${item.totalPoints > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {item.totalPoints > 0 ? '+' : ''}{item.totalPoints} pts
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Event Log */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-6">Recent Risk Events</h2>
                <div className="space-y-4">
                    {(events || []).map((event) => (
                        <div key={event._id} className={`flex items-start p-4 rounded-xl border ${getEventColor(event.eventType)}`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold">{event.eventType}</span>
                                    <span className="text-xs opacity-70 bg-white/50 px-2 py-0.5 rounded-full">
                                        {new Date(event.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-sm opacity-90">
                                    Account: <span className="font-mono font-bold">{(event.accountId as any)?.number || (event.accountId as any)?.name || 'Unknown'}</span>
                                    {event.metadata?.error && (
                                        <div className="mt-1 text-xs bg-black/5 p-2 rounded-lg font-mono">
                                            {event.metadata.error}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="font-black text-lg">
                                {event.points > 0 ? '+' : ''}{event.points}
                            </div>
                        </div>
                    ))}
                    {(events || []).length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            No risk events logged yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WhatsAppRisk;
