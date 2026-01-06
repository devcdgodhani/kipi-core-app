import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import shipmentService from '../../services/shipmentService';
import { type IShipment, SHIPMENT_STATUS } from '../../types/shipment.types';
import { StatusBadge } from '../../components/logistics/StatusBadge';
import { Search, Filter, Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export const ShipmentList: React.FC = () => {
    const navigate = useNavigate();
    const [shipments, setShipments] = useState<IShipment[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ page: 1, limit: 10, status: '', search: '' });

    const fetchShipments = async () => {
        setLoading(true);
        try {
            const data = await shipmentService.getAll(filters as any, filters.page, filters.limit);
            setShipments(data.recordList || []); // Adjust based on actual API response structure
        } catch (error) {
            console.error('Failed to fetch shipments', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShipments();
    }, [filters.page, filters.status]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchShipments();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Shipment Management</h1>
                <button
                    onClick={fetchShipments}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                    <RefreshCw size={18} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Order ID, AWB..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && fetchShipments()}
                        />
                    </div>
                </div>

                <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    >
                        <option value="">All Statuses</option>
                        {Object.values(SHIPMENT_STATUS).map((status) => (
                            <option key={status} value={status}>{status.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Loading shipments...</td>
                            </tr>
                        ) : shipments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No shipments found</td>
                            </tr>
                        ) : (
                            shipments.map((shipment) => (
                                <tr key={shipment._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {shipment.shipmentNumber || shipment._id.slice(-8).toUpperCase()}
                                        <div className="text-xs text-gray-500 font-normal">AWB: {shipment.awb}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                                        #{shipment.orderNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(shipment.createdAt), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {shipment.courierName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={shipment.status} size="sm" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => navigate(`/shipments/${shipment._id}`)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
