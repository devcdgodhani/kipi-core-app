
import React, { useState } from 'react';
import { etaService } from '../../services/eta.service';
import type { EtaResponse } from '../../types/eta.types';
import { Truck, AlertCircle, Loader2, MapPin } from 'lucide-react';

interface ETACheckerProps {
    pincode?: string;
}

const ETAChecker: React.FC<ETACheckerProps> = ({ pincode }) => {
    const [inputPincode, setInputPincode] = useState(pincode || '');
    const [etaData, setEtaData] = useState<EtaResponse[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        if (inputPincode.length !== 6) {
            setError('Please enter a valid 6-digit pincode');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await etaService.check({ destinationPincode: inputPincode });
            setEtaData(data);
        } catch (err) {
            setError('Failed to check delivery availability');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-gray-900 mb-2">
                <Truck size={18} className="text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Delivery Options</h3>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={inputPincode}
                        onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter Pincode"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-primary focus:outline-none transition-all uppercase font-medium"
                    />
                </div>
                <button
                    onClick={handleCheck}
                    disabled={loading || inputPincode.length !== 6}
                    className="px-6 py-3 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Check'}
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100 italic">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {etaData && etaData.length > 0 && (
                <div className="space-y-4 pt-2">
                    {etaData.map((eta, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-gray-900 uppercase">Express Delivery</span>
                                <span className="text-xs font-bold text-primary italic">₹{eta.shippingCost === 0 ? 'FREE' : eta.shippingCost}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                Delivery by <span className="text-gray-900 font-bold">{new Date(eta.estimatedDeliveryDate).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                                {eta.codAvailable ? 'Cash on Delivery Available' : 'Prepaid Only'}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ETAChecker;
