
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { whatsappAccountService, type IWhatsAppAccount } from '../../services/whatsappAccount.service';
import { Smartphone, Power, ShieldCheck, Activity, Save, ArrowLeft, Calendar, User, Terminal, HardDrive } from 'lucide-react';
import CustomButton from '../../components/common/Button';

const WhatsAppAccountDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [account, setAccount] = useState<IWhatsAppAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit States
    const [editName, setEditName] = useState('');
    const [editAutoResume, setEditAutoResume] = useState(true);
    const [editNumberDate, setEditNumberDate] = useState('');

    useEffect(() => {
        const fetchAccount = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response: any = await whatsappAccountService.getOne(id);
                const accountData = response.data;
                setAccount(accountData);
                setEditName(accountData.name);
                setEditAutoResume(accountData.isAutoResume ?? true);
                setEditNumberDate(accountData.numberActivatedAt ? new Date(accountData.numberActivatedAt).toISOString().split('T')[0] : '');
            } catch (error) {
                console.error('Error fetching account:', error);
                toast.error('Account not found');
                navigate('/whatsapp/accounts');
            } finally {
                setLoading(false);
            }
        };
        fetchAccount();
    }, [id, navigate]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) return;
        try {
            setSaving(true);
            await whatsappAccountService.update(account._id, {
                name: editName,
                isAutoResume: editAutoResume,
                numberActivatedAt: editNumberDate ? new Date(editNumberDate).toISOString() : null,
            });
            toast.success('Configuration synchronized');
            const response: any = await whatsappAccountService.getOne(account._id);
            if (response.data) setAccount(response.data);
        } catch (error: any) {
            toast.error(`Sync failure: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !account) {
        return (
            <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Terminal className="w-12 h-12 text-primary animate-pulse" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Accessing Node Configuration...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700 h-full overflow-y-auto">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] border border-primary/5 shadow-2xl shadow-gray-200/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10 flex items-center gap-8">
                    <button
                        onClick={() => navigate('/whatsapp/accounts')}
                        className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-all border border-gray-100 hover:border-primary/10"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase font-mono">{account.name}</h1>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${account.socketStatus === 'CONNECTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                {account.socketStatus}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Origin Instance ID: <span className="font-mono font-bold text-gray-400">{account._id}</span></p>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-4 bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                        <Smartphone size={20} />
                    </div>
                    <div className="pr-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Linked Identity</div>
                        <div className="text-sm font-black text-gray-900 font-mono tracking-tight">{account.number || 'NOT_CONNECTED'}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Matrix */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 relative overflow-hidden">
                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100/50 shadow-sm">
                                <Terminal size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">Node Architecture</h2>
                                <p className="text-sm text-gray-500 font-medium">Modify origin parameters and operational behaviors</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <User size={12} /> Terminal Alias
                                    </label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full h-16 px-6 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus:bg-white outline-none transition-all font-bold text-gray-700 text-lg shadow-inner"
                                        placeholder="ALPA-UNIT-0"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Calendar size={12} /> Activation Epoch
                                    </label>
                                    <input
                                        type="date"
                                        value={editNumberDate}
                                        onChange={(e) => setEditNumberDate(e.target.value)}
                                        className="w-full h-16 px-6 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:ring-8 focus:ring-primary/5 focus:border-primary focus:bg-white outline-none transition-all font-bold text-gray-700 text-lg shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-8 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[2.5rem] group hover:bg-white hover:border-primary/20 transition-all duration-500">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl ${editAutoResume ? 'bg-primary text-white shadow-primary/20' : 'bg-gray-100 text-gray-400 shadow-none'}`}>
                                        <Power size={32} />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-gray-900 uppercase tracking-tight">Auto-Resume Persistence</div>
                                        <div className="text-xs text-gray-500 font-medium mt-1">Automatically restore socket connection on service synchronization</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer scale-125 mr-4">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={editAutoResume}
                                        onChange={(e) => setEditAutoResume(e.target.checked)}
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex justify-end pt-6">
                                <CustomButton
                                    type="submit"
                                    disabled={saving}
                                    className="h-16 px-12 rounded-2xl shadow-2xl shadow-primary/20 flex items-center gap-3 transition-all active:scale-95"
                                >
                                    <Save size={20} />
                                    <span className="font-black uppercase tracking-widest text-xs">{saving ? 'Synchronizing...' : 'Save Configuration'}</span>
                                </CustomButton>
                            </div>
                        </form>
                    </div>

                    {/* Operational Telemetry */}
                    <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40">
                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100/50 shadow-sm">
                                <HardDrive size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">System Residency</h2>
                                <p className="text-sm text-gray-500 font-medium">Node distribution and uptime telemetrics</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all duration-500">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Core State</div>
                                <div className="text-xl font-black text-gray-900 uppercase tracking-tight font-mono">{account.status}</div>
                                <div className="w-8 h-1 bg-primary/20 rounded-full mt-6 group-hover:w-12 transition-all" />
                            </div>
                            <div className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all duration-500">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Uplink Stat</div>
                                <div className={`text-xl font-black uppercase tracking-tight font-mono ${account.socketStatus === 'CONNECTED' ? 'text-emerald-500 animate-pulse' : 'text-gray-400'}`}>{account.socketStatus}</div>
                                <div className="w-8 h-1 bg-primary/20 rounded-full mt-6 group-hover:w-12 transition-all" />
                            </div>
                            <div className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all duration-500">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Last Sync</div>
                                <div className="text-xl font-black text-gray-900 uppercase tracking-tight font-mono">{account.activatedAt ? new Date(account.activatedAt).toLocaleDateString() : 'N/A'}</div>
                                <div className="w-8 h-1 bg-primary/20 rounded-full mt-6 group-hover:w-12 transition-all" />
                            </div>
                            <div className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all duration-500">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Last Update</div>
                                <div className="text-xl font-black text-gray-900 uppercase tracking-tight font-mono">{account.updatedAt ? new Date(account.updatedAt).toLocaleDateString() : 'N/A'}</div>
                                <div className="w-8 h-1 bg-primary/20 rounded-full mt-6 group-hover:w-12 transition-all" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Authority Sidebar */}
                <div className="space-y-8">
                    <div className="bg-gray-900 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-gray-900/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-1000" />

                        <div className="flex items-center gap-5 mb-10 relative z-10">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-sm">
                                <ShieldCheck size={28} className="text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">Health Integrity</h2>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Heuristic Evaluation</p>
                            </div>
                        </div>

                        <div className="space-y-10 relative z-10">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Risk Density</span>
                                    <span className={`text-sm font-black tracking-tighter ${(account.riskScore || 0) > 60 ? 'text-rose-400' : 'text-emerald-400'}`}>{account.riskScore ?? 0}%</span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)] ${(account.riskScore || 0) > 80 ? 'bg-rose-500 shadow-rose-500/50' : (account.riskScore || 0) > 50 ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-500 shadow-emerald-500/50'
                                            }`}
                                        style={{ width: `${account.riskScore || 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center group/card hover:bg-white/10 transition-colors">
                                    <Activity size={20} className="text-primary mx-auto mb-4" />
                                    <div className="text-3xl font-black text-white tracking-tighter">{account.sentToday || 0}</div>
                                    <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1 group-hover/card:text-white/40 transition-colors">Relays Today</div>
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center group/card hover:bg-white/10 transition-colors">
                                    <BarChart2 size={20} className="text-indigo-400 mx-auto mb-4" />
                                    <div className="text-3xl font-black text-white tracking-tighter">{account.metadata?.totalSent || 0}</div>
                                    <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1 group-hover/card:text-white/40 transition-colors">Life Throughput</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Activity size={20} />
                            </div>
                            <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">Traffic Control</h3>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            This instance is currently routed through the <span className="text-indigo-600 font-black">STANDARD-RELAY</span> cluster. Peak throughput is capped at 500 messages/day to maintain optimal risk density.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BarChart2 = ({ size, className }: { size?: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

export default WhatsAppAccountDetails;
