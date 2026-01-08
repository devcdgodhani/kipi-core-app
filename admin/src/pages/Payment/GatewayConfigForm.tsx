import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import type { PaymentGateway, UpdateGatewayPayload } from '../../types/payment';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { ROUTES } from '../../routes/routeConfig';

const GatewayConfigForm: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are in create mode (path ends with /new or name is undefined)
    const isCreateMode = location.pathname.endsWith('/new');

    const [loading, setLoading] = useState(!isCreateMode);
    const [saving, setSaving] = useState(false);
    const [gateway, setGateway] = useState<PaymentGateway | null>(null);
    const [formData, setFormData] = useState<UpdateGatewayPayload>({
        displayName: '',
        environment: 'sandbox',
        priority: 1,
        webhookSecret: '',
        config: {},
        credentials: {}
    });

    // Additional state for create mode
    const [selectedProvider, setSelectedProvider] = useState<string>('razorpay');

    useEffect(() => {
        const fetchGateway = async () => {
            if (isCreateMode) return;
            if (!name) return;

            try {
                setLoading(true);
                const gateways = await paymentService.getAllGateways();
                const found = gateways.find(g => g.name === name);
                if (found) {
                    setGateway(found);
                    setFormData({
                        displayName: found.displayName,
                        environment: found.environment,
                        priority: found.priority,
                        webhookSecret: found.webhookSecret,
                        config: found.config || {},
                        credentials: found.credentials as any // Cast because API returns object now
                    });
                } else {
                    toast.error('Gateway not found');
                    navigate(`/${ROUTES.DASHBOARD.PAYMENT_GATEWAYS}`);
                }
            } catch (error: any) {
                console.error('Error fetching gateway:', error);
                toast.error(error.response?.data?.message || 'Failed to fetch gateway');
            } finally {
                setLoading(false);
            }
        };

        fetchGateway();
    }, [name, navigate, isCreateMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            if (isCreateMode) {
                await paymentService.createGateway({
                    ...formData,
                    name: selectedProvider as any, // In create mode, we use the selected provider as name
                    isEnabled: false // Default to disabled
                });
                toast.success('Gateway created successfully');
            } else {
                if (!name) return;
                await paymentService.updateGateway(name as any, formData);
                toast.success('Gateway configuration updated successfully');
            }
            navigate(`/${ROUTES.DASHBOARD.PAYMENT_GATEWAYS}`);
        } catch (error: any) {
            console.error('Error saving gateway:', error);
            toast.error(error.response?.data?.message || 'Failed to save gateway');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-semibold">Loading gateway configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(`/${ROUTES.DASHBOARD.PAYMENT_GATEWAYS}`)}
                    className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">
                        {isCreateMode ? 'Add New Gateway' : `Configure ${gateway?.displayName}`}
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        {isCreateMode ? 'Set up a new payment provider integration' : 'Update gateway settings and credentials'}
                    </p>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-sm font-black text-amber-900 mb-1 uppercase tracking-wide">Security Notice</h3>
                    <p className="text-xs text-amber-700 leading-relaxed">
                        Credentials are encrypted before storage. Make sure to use correct API keys from your payment gateway dashboard.
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Provider Selection (Only in Create Mode) */}
                    {isCreateMode && (
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                                Payment Provider
                            </label>
                            <select
                                value={selectedProvider}
                                onChange={(e) => {
                                    setSelectedProvider(e.target.value);
                                    // Auto-fill display name based on provider
                                    const displayName = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
                                    setFormData(prev => ({ ...prev, displayName }));
                                }}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all font-semibold"
                                required
                            >
                                <option value="razorpay">Razorpay</option>
                                <option value="phonepe">PhonePe</option>
                                <option value="paytm">Paytm</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">Select the payment provider you wish to integrate.</p>
                        </div>
                    )}

                    {/* Display Name */}
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={formData.displayName}
                            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all font-semibold"
                            required
                        />
                    </div>

                    {/* Environment */}
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                            Environment
                        </label>
                        <select
                            value={formData.environment}
                            onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value as any }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all font-semibold"
                            required
                        >
                            <option value="sandbox">Sandbox (Testing)</option>
                            <option value="production">Production (Live)</option>
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                            Priority Order
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.priority}
                            onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all font-semibold"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Lower number = higher priority</p>
                    </div>

                    {/* Webhook Secret */}
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                            Webhook Secret
                        </label>
                        <input
                            type="text"
                            value={formData.webhookSecret}
                            onChange={(e) => setFormData(prev => ({ ...prev, webhookSecret: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all font-semibold font-mono text-sm"
                            placeholder="Enter webhook secret key"
                            required
                        />
                    </div>

                    {/* Credentials (JSON) */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                            Credentials (JSON)
                        </label>
                        <textarea
                            value={typeof formData.credentials === 'string'
                                ? formData.credentials
                                : JSON.stringify(formData.credentials || {}, null, 2)}
                            onChange={(e) => {
                                const value = e.target.value;
                                try {
                                    const credentials = JSON.parse(value);
                                    setFormData(prev => ({ ...prev, credentials }));
                                } catch (err) {
                                    // If not valid JSON, treat as string (encrypted value preservation or typing)
                                    setFormData(prev => ({ ...prev, credentials: value }));
                                }
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all font-mono text-sm h-32"
                            placeholder='{ "keyId": "...", "keySecret": "..." }'
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Enter provider specific credentials as JSON object. Existing credentials are shown as encrypted string.
                        </p>
                    </div>
                </div>

                {/* Gateway Status (Only in Edit Mode) */}
                {!isCreateMode && gateway && (
                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-gray-700 uppercase tracking-wide">Current Status</h3>
                                <p className="text-xs text-gray-500 mt-1">Gateway is currently {gateway.isEnabled ? 'enabled' : 'disabled'}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border ${gateway.isEnabled
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : 'bg-gray-50 text-gray-500 border-gray-100'
                                }`}>
                                {gateway.isEnabled ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => navigate(`/${ROUTES.DASHBOARD.PAYMENT_GATEWAYS}`)}
                        className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold uppercase text-sm tracking-wider hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 rounded-xl shadow-xl shadow-primary/20"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} className="mr-2" />
                                {isCreateMode ? 'Create Gateway' : 'Save Configuration'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default GatewayConfigForm;
