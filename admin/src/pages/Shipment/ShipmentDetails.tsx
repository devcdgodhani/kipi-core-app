import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import shipmentService from '../../services/shipmentService';
import type { IShipment } from '../../types/shipment.types';
import { StatusBadge } from '../../components/logistics/StatusBadge';
import { TrackingTimeline } from '../../components/logistics/TrackingTimeline';
import {
    ArrowLeft,
    Package,
    Truck,
    Copy,
    ExternalLink,
    AlertTriangle,
    Calendar,
    MapPin,
    BarChart3,
    QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import CustomButton from '../../components/common/Button';
import { toast } from 'react-hot-toast';

export const ShipmentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [shipment, setShipment] = useState<IShipment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (id) {
            loadShipment(id);
        }
    }, [id]);

    const loadShipment = async (shipmentId: string) => {
        try {
            setLoading(true);
            const data = await shipmentService.getById(shipmentId);
            setShipment(data);
        } catch (err) {
            setError('Could not load shipment details');
            toast.error('Failed to retrieve shipment Intel');
        } finally {
            setLoading(false);
        }
    };

    const handleResolveNDR = async (resolution: 'RE-ATTEMPT' | 'RTO-CONFIRMED') => {
        if (!id) return;
        try {
            setActionLoading(true);
            await shipmentService.resolveNDR(id, resolution, `Manual intervention via Logistics Hub`);
            toast.success(`Intervention Protocol: ${resolution} initiated`);
            loadShipment(id);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Resolution Protocol Failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleGenerateLabel = async () => {
        if (!id) return;
        try {
            setActionLoading(true);
            const data = await shipmentService.generateLabel(id);
            toast.success('Label Matrix Generated');
            if (data.labelUrl) {
                window.open(data.labelUrl, '_blank');
            }
            loadShipment(id);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Label Synthesis Failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateLabel = () => {
        if (shipment?.labelUrl) {
            window.open(shipment.labelUrl, '_blank');
        } else {
            toast.error('Shipping Label not generated yet');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Vector copied to clipboard');
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="font-black text-primary uppercase tracking-[0.2em] animate-pulse">Synchronizing Neural Link...</p>
        </div>
    );

    if (!shipment || error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-100">
                <AlertTriangle size={40} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Signal Lost</h2>
                <p className="text-gray-500 font-medium mt-2">{error || 'Shipment record not found in the control grid'}</p>
            </div>
            <CustomButton onClick={() => navigate('/shipments')} variant="secondary" className="rounded-2xl">
                <ArrowLeft size={18} className="mr-2" /> Back to Base
            </CustomButton>
        </div>
    );

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header / Navigate Back */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/shipments')}
                    className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-gray-500 hover:text-primary shadow-sm active:scale-90"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Logistics Overview</span>
                    <h1 className="text-2xl font-black text-primary leading-none mt-1">
                        #{shipment.shipmentNumber || shipment._id.slice(-8).toUpperCase()}
                    </h1>
                </div>
            </div>

            {/* Premium Hero Section */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-gray-100/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-24 h-24 rounded-[2rem] bg-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
                                <Package size={48} />
                            </div>
                            <div className="text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Active Pulse</h2>
                                    <StatusBadge status={shipment.status} />
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-gray-400">
                                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary/40" /> {format(new Date(shipment.createdAt), 'PP p')}</span>
                                    <span className="flex items-center gap-1.5"><Truck size={14} className="text-primary/40" /> {shipment.courierName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <CustomButton
                                onClick={() => {
                                    if (shipment.labelUrl) handleCreateLabel();
                                    else handleGenerateLabel();
                                }}
                                loading={actionLoading}
                                variant="secondary"
                                className="h-14 px-8 rounded-2xl shadow-lg border-2 border-primary/5"
                            >
                                <QrCode size={20} className="mr-2" />
                                {shipment.labelUrl ? 'Manifest Label' : 'Generate Label'}
                            </CustomButton>
                            <CustomButton
                                onClick={() => {
                                    const url = shipment.trackingUrl || `https://shiprocket.co/tracking/${shipment.awb}`;
                                    window.open(url, '_blank');
                                }}
                                className="h-14 px-8 rounded-2xl shadow-xl shadow-primary/20"
                            >
                                <ExternalLink size={20} className="mr-2" />
                                Neural Track
                            </CustomButton>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-gray-50">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AWB Vector</span>
                            <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => copyToClipboard(shipment.awb)}>
                                <span className="font-mono text-lg font-bold text-gray-700">{shipment.awb}</span>
                                <Copy size={14} className="text-gray-300 group-hover/copy:text-primary transition-colors" />
                            </div>
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Relay</span>
                            <p className="text-lg font-black text-blue-600 hover:underline cursor-pointer">#{shipment.orderNumber}</p>
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payload Weight</span>
                            <p className="text-lg font-black text-gray-700">{shipment.weight} KG</p>
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Volumetrics</span>
                            <p className="text-sm font-black text-gray-700 uppercase">{shipment.dimensions?.length}x{shipment.dimensions?.width}x{shipment.dimensions?.height} CM</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-primary p-8 rounded-[2.5rem] text-white shadow-xl shadow-primary/20 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Relay Endpoint</h3>
                            <p className="text-white/70 text-sm mt-2 font-medium leading-relaxed">
                                Destination finalized at Order Hub #{shipment.orderNumber}. Synchronized for secure delivery.
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Estimated Arrival</span>
                        <p className="text-2xl font-black mt-1">
                            {shipment.estimatedDeliveryDate ? format(new Date(shipment.estimatedDeliveryDate), 'MMM d, yyyy') : 'TBD'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <BarChart3 size={20} className="text-primary" />
                                <h3 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">Transit Stream</h3>
                            </div>
                        </div>
                        <div className="p-8 pb-12">
                            <TrackingTimeline events={shipment.timeline} />
                        </div>
                    </div>
                </div>

                {/* Sidebar: Metadata & Actions */}
                <div className="space-y-6">
                    {/* Carrier Info */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                            <Truck size={20} className="text-primary" />
                            <h3 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">Logistics Provider</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Name</span>
                                <span className="text-sm font-black text-gray-700">{shipment.courierName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Origin</span>
                                <span className="text-sm font-black text-gray-700">Warehouse Hub</span>
                            </div>
                            {shipment.currentLocation && (
                                <div className="pt-4 border-t border-gray-50">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Last Contact</span>
                                    <p className="text-sm font-bold text-gray-700 italic">"Detected at {shipment.currentLocation}"</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Intervention Action */}
                    {['RTO_INITIATED', 'NDR'].includes(shipment.status) && (
                        <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] space-y-6">
                            <div className="flex items-center gap-3 text-rose-600">
                                <AlertTriangle size={24} />
                                <h3 className="font-black uppercase text-xs tracking-widest leading-none mt-1">Critical Intervention</h3>
                            </div>
                            <p className="text-rose-700/70 text-sm font-medium leading-relaxed">
                                Terminal report indicates delivery failure. Manual override required to restore delivery lifecycle.
                            </p>
                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={() => handleResolveNDR('RE-ATTEMPT')}
                                    disabled={actionLoading}
                                    className="w-full h-14 bg-white border-2 border-rose-100 text-rose-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-rose-100 transition-all shadow-lg shadow-rose-100/50 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Syncing...' : 'Request Pulse re-attempt'}
                                </button>
                                <button
                                    onClick={() => handleResolveNDR('RTO-CONFIRMED')}
                                    disabled={actionLoading}
                                    className="w-full h-14 bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Committing...' : 'Finalize Terminal RTO'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
