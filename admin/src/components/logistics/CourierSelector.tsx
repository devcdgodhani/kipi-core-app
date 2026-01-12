import React, { useState, useEffect } from 'react';
import etaService from '../../services/etaService';
import type { IEtaOption } from '../../types/eta.types';
import { Truck, IndianRupee, Clock, Star } from 'lucide-react';

interface CourierSelectorProps {
    pickupPincode: string;
    deliveryPincode: string;
    weight: number;
    cod: boolean;
    onSelect: (option: IEtaOption) => void;
    selectedCourierId?: string;
}

export const CourierSelector: React.FC<CourierSelectorProps> = ({
    pickupPincode,
    deliveryPincode,
    weight,
    cod,
    onSelect,
    selectedCourierId
}) => {
    const [options, setOptions] = useState<IEtaOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (pickupPincode && deliveryPincode && weight > 0) {
            fetchEta();
        }
    }, [pickupPincode, deliveryPincode, weight, cod]);

    const fetchEta = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await etaService.calculate(pickupPincode, deliveryPincode, weight, cod);
            setOptions(response.data);
        } catch (err) {
            setError('Failed to fetch courier options');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-sm text-gray-500 animate-pulse">Calculating best couriers...</div>;
    if (error) return <div className="text-sm text-red-500">{error}</div>;

    return (
        <div className="space-y-3">
            {options.map((option) => (
                <div
                    key={option.courierId}
                    onClick={() => onSelect(option)}
                    className={`relative border rounded-lg p-3 cursor-pointer transition-all hover:border-blue-500 ${selectedCourierId?.toString() === option.courierId.toString() ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200'
                        }`}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Truck size={20} className="text-gray-700" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{option.courierName}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Clock size={10} /> {option.estimatedDays} Days</span>
                                    <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400 fill-yellow-400" /> {option.ratings || 4.5}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-900 flex items-center justify-end">
                                <IndianRupee size={14} /> {option.cost}
                            </p>
                            {option.isFastest && <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded font-medium mt-1">Fastest</span>}
                            {option.isCheapest && <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-medium mt-1 ml-1">Cheapest</span>}
                        </div>
                    </div>
                </div>
            ))}
            {options.length === 0 && !loading && (
                <div className="text-center py-4 text-gray-500 text-sm">
                    Enter details to see available couriers
                </div>
            )}
        </div>
    );
};
