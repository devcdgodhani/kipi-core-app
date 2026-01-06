import React, { useState, useEffect } from 'react';
import courierService from '../../services/courierService';
import type { ICourier } from '../../types/courier.types';
import { Truck, ToggleLeft, ToggleRight, Settings } from 'lucide-react';

export const CourierConfig: React.FC = () => {
    const [couriers, setCouriers] = useState<ICourier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCouriers();
    }, []);

    const fetchCouriers = async () => {
        try {
            const data = await courierService.getAll();
            setCouriers(data || []);
        } catch (error) {
            console.error('Failed to load couriers');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await courierService.toggleActive(id, !currentStatus);
            setCouriers(couriers.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Courier Configuration</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <p>Loading couriers...</p> : couriers.map((courier) => (
                    <div key={courier._id} className="bg-white rounded-lg shadow p-6 flex flex-col justify-between h-48 border border-gray-100 hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Truck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{courier.name}</h3>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{courier.type}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleStatus(courier._id, courier.isActive)}
                                className={`transition-colors ${courier.isActive ? 'text-green-500' : 'text-gray-300'}`}
                            >
                                {courier.isActive ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                            </button>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                            <span className="text-gray-500">Priority: {courier.priority}</span>
                            <button className="text-gray-400 hover:text-gray-600 flex items-center gap-1">
                                <Settings size={14} /> Configure
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
