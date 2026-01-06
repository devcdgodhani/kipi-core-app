import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import shipmentService from '../../services/shipmentService';
import type { IShipment } from '../../types/shipment.types';
import { StatusBadge } from '../../components/logistics/StatusBadge';
import { TrackingTimeline } from '../../components/logistics/TrackingTimeline';
import { ArrowLeft, Package, Truck, Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export const ShipmentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [shipment, setShipment] = useState<IShipment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            loadShipment(id);
        }
    }, [id]);

    const loadShipment = async (shipmentId: string) => {
        try {
            const data = await shipmentService.getById(shipmentId);
            setShipment(data);
        } catch (err) {
            setError('Could not load shipment details');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLabel = () => {
        if (shipment?.labelUrl) {
            window.open(shipment.labelUrl, '_blank');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading shipment details...</div>;
    if (!shipment || error) return <div className="p-8 text-center text-red-500">{error || 'Shipment not found'}</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button
                onClick={() => navigate('/shipments')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
            >
                <ArrowLeft size={18} /> Back to Shipments
            </button>

            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Shipment #{shipment.shipmentNumber || shipment._id.slice(-8)}
                            </h1>
                            <StatusBadge status={shipment.status} />
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-4">
                            <span>Placed: {format(new Date(shipment.createdAt), 'PP p')}</span>
                            {shipment.actualDeliveryDate && (
                                <span className="text-green-600">Delivered: {format(new Date(shipment.actualDeliveryDate), 'PP')}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            disabled={!shipment.labelUrl}
                            onClick={handleCreateLabel}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 border ${shipment.labelUrl
                                ? 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                : 'border-gray-200 text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            <Package size={18} /> Download Label
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
                            <ExternalLink size={18} /> Track on Courier
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tracking */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Truck className="text-blue-500" /> Tracking History
                        </h3>
                        <TrackingTimeline events={shipment.timeline} />
                    </div>

                    {/* Items */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Shipment Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Carrier</p>
                                <p className="font-medium text-gray-900">{shipment.courierName}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">AWB Number</p>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900">{shipment.awb}</p>
                                    <Copy size={14} className="cursor-pointer text-gray-400 hover:text-gray-600" />
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-500">Weight</p>
                                <p className="font-medium text-gray-900">{shipment.weight} kg</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Dimensions</p>
                                <p className="font-medium text-gray-900">{shipment.dimensions?.length} x {shipment.dimensions?.width} x {shipment.dimensions?.height} cm</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Address & Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Address</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {/* Note: In a real app we'd need to populate or store address snapshot in shipment */}
                            Shipping Address from Order #{shipment.orderNumber}
                        </p>
                    </div>

                    {/* RTO Actions (if applicable) */}
                    {['RTO_INITIATED', 'NDR'].includes(shipment.status) && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
                                <AlertTriangle size={20} /> Action Required
                            </h3>
                            <p className="text-red-700 text-sm mb-4">This shipment has been flagged for non-delivery.</p>
                            <div className="space-y-2">
                                <button className="w-full py-2 bg-white border border-red-300 text-red-700 rounded hover:bg-red-50">Attempt Re-delivery</button>
                                <button className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700">Initiate RTO</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
