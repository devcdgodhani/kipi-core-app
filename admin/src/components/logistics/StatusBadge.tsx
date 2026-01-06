import React from 'react';
import { SHIPMENT_STATUS } from '../../types/shipment.types';
import { Package, Truck, CheckCircle, AlertTriangle, AlertCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    [SHIPMENT_STATUS.CREATED]: { color: 'bg-blue-100 text-blue-700', icon: Package, label: 'Created' },
    [SHIPMENT_STATUS.SCHEDULED]: { color: 'bg-indigo-100 text-indigo-700', icon: Clock, label: 'Scheduled' },
    [SHIPMENT_STATUS.PICKED_UP]: { color: 'bg-purple-100 text-purple-700', icon: Truck, label: 'Picked Up' },
    [SHIPMENT_STATUS.IN_TRANSIT]: { color: 'bg-yellow-100 text-yellow-700', icon: Truck, label: 'In Transit' },
    [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: { color: 'bg-orange-100 text-orange-700', icon: Truck, label: 'Out for Delivery' },
    [SHIPMENT_STATUS.DELIVERED]: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Delivered' },
    [SHIPMENT_STATUS.CANCELLED]: { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'Cancelled' },
    [SHIPMENT_STATUS.RTO_INITIATED]: { color: 'bg-red-100 text-red-700', icon: AlertTriangle, label: 'RTO Initiated' },
    [SHIPMENT_STATUS.RTO_DELIVERED]: { color: 'bg-red-200 text-red-800', icon: AlertCircle, label: 'RTO Delivered' },
    [SHIPMENT_STATUS.NDR]: { color: 'bg-pink-100 text-pink-700', icon: AlertTriangle, label: 'NDR' },
    [SHIPMENT_STATUS.LOST]: { color: 'bg-gray-800 text-white', icon: AlertTriangle, label: 'Lost' },
    [SHIPMENT_STATUS.DAMAGED]: { color: 'bg-red-900 text-white', icon: AlertTriangle, label: 'Damaged' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-600', icon: Package, label: status };
    const Icon = config.icon;

    const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-2 text-base' : 'px-2.5 py-0.5 text-sm';
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.color} ${sizeClass}`}>
            <Icon size={iconSize} />
            {config.label}
        </span>
    );
};
