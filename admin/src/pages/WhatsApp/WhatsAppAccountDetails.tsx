import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { whatsappAccountService, type IWhatsAppAccount } from '../../services/whatsappAccount.service';
import { Smartphone, Power, ShieldCheck, Activity, Save, ArrowLeft } from 'lucide-react';
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
                navigate(-1);
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
            toast.success('Account updated successfully');
            // Refresh
            const response: any = await whatsappAccountService.getOne(account._id);
            if (response.data) setAccount(response.data);
        } catch (error: any) {
            toast.error(`Error updating account: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !account) {
        return <div className="p-8 text-center text-gray-500">Loading account details...</div>;
    }

    return (
        <div className="p-6 space-y-6 flex flex-col h-full bg-gray-50/50 animate-in fade-in duration-500 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className={`w-2 h-2 rounded-full ${account.socketStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                        {account.socketStatus}
                        <span className="text-gray-300">•</span>
                        {account.number || 'No Number Connected'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Smartphone size={20} className="text-indigo-600" />
                            Account Settings
                        </h2>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">SIM Purchase Date</label>
                                    <input
                                        type="date"
                                        value={editNumberDate}
                                        onChange={(e) => setEditNumberDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Date when the SIM/Number was acquired</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${editAutoResume ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Power size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">Auto-Resume</div>
                                        <div className="text-xs text-gray-500">Automatically reconnect on server restart</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={editAutoResume}
                                        onChange={(e) => setEditAutoResume(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            <div className="flex justify-end pt-4">
                                <CustomButton
                                    type="submit"
                                    disabled={saving}
                                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30"
                                >
                                    <Save size={18} />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </CustomButton>
                            </div>
                        </form>
                    </div>

                    {/* Technical Details (Hiding IDs) */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-emerald-600" />
                            Technical Status
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</div>
                                <div className="font-mono font-bold text-gray-900">{account.status}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Socket</div>
                                <div className={`font-mono font-bold ${account.socketStatus === 'CONNECTED' ? 'text-emerald-600' : 'text-gray-600'}`}>{account.socketStatus}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Session Active</div>
                                <div className="font-mono font-bold text-gray-900">{account.activatedAt ? new Date(account.activatedAt).toLocaleDateString() : 'N/A'}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Last Updated</div>
                                <div className="font-mono font-bold text-gray-900">{account.updatedAt ? new Date(account.updatedAt).toLocaleDateString() : 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <ShieldCheck size={20} className="text-amber-600" />
                            Health & Risk
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">Risk Score</span>
                                    <span className="font-bold text-gray-900">{account.riskScore ?? 0}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${(account.riskScore || 0) > 80 ? 'bg-rose-500' : (account.riskScore || 0) > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                        style={{ width: `${account.riskScore || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-2xl font-black text-gray-900">{account.sentToday || 0}</div>
                                    <div className="text-xs text-gray-500 font-medium">Sent Today</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-gray-900">{account.metadata?.totalSent || 0}</div>
                                    <div className="text-xs text-gray-500 font-medium">Lifetime</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppAccountDetails;
