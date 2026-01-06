import React, { useState, useEffect } from 'react';
import rtoService from '../../services/rtoService';
import type { IRtoStats } from '../../types/rto.types';
import { AlertTriangle, BarChart2, ShieldAlert, TrendingDown } from 'lucide-react';

export const RtoDashboard: React.FC = () => {
    const [stats, setStats] = useState<IRtoStats | null>(null);

    useEffect(() => {
        // Mock load stats or implement API
        // rtoService.getStats().then(setStats);
        setStats({
            totalRtoConfigured: 15,
            highRiskOrders: 42,
            rtoRate: 8.5
        });
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">RTO Management Dashboard</h1>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Daily RTO Rate</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.rtoRate}%</h3>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <TrendingDown size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-red-600 mt-2 font-medium">↑ 1.2% from last week</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">High Risk Orders</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.highRiskOrders}</h3>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                            <ShieldAlert size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Requires verification</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active NDRs</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">18</h3>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Pending customer action</p>
                </div>
            </div>

            {/* RTO List Stub */}
            <div className="bg-white rounded-lg shadow p-8 text-center border-2 border-dashed border-gray-200">
                <BarChart2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">RTO Analytics & List</h3>
                <p className="text-gray-500 mt-1">Detailed breakdown of return reasons and scoring metrics coming soon.</p>
            </div>
        </div>
    );
};
