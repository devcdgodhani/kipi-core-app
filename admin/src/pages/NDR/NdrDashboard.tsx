import React, { useState, useEffect } from 'react';
import ndrService, { type INDR } from '../../services/ndrService';
import { RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export const NdrDashboard: React.FC = () => {
    const [ndrs, setNdrs] = useState<INDR[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedNdr, setSelectedNdr] = useState<INDR | null>(null);
    const [resolving, setResolving] = useState(false);

    // Resolution Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resolutionData, setResolutionData] = useState({
        resolution: 'RE-ATTEMPT',
        customerAction: '',
        rescheduledDate: '',
        updatedAddress: ''
    });

    const fetchNdrs = async () => {
        setLoading(true);
        try {
            const response = await ndrService.getAll({}, 1, 50);
            setNdrs(response.data?.recordList || []);
        } catch (error) {
            console.error('Failed to fetch NDRs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNdrs();
    }, []);

    const handleResolve = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedNdr) return;

        setResolving(true);
        try {
            await ndrService.resolve(selectedNdr._id, resolutionData);
            setIsModalOpen(false);
            fetchNdrs();
        } catch (error) {
            console.error('Failed to resolve NDR', error);
        } finally {
            setResolving(false);
        }
    };

    const openResolveModal = (ndr: INDR) => {
        setSelectedNdr(ndr);
        setIsModalOpen(true);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESOLVED': return <CheckCircle2 size={16} className="text-green-500" />;
            case 'PENDING': return <Clock size={16} className="text-amber-500" />;
            case 'CANCELLED': return <XCircle size={16} className="text-red-500" />;
            default: return <AlertCircle size={16} className="text-blue-500" />;
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">NDR Management Panel</h1>
                    <p className="text-gray-500 text-sm mt-1">Track and resolve non-delivery reports to reduce RTO.</p>
                </div>
                <button
                    onClick={fetchNdrs}
                    className="flex items-center gap-2 px-4 py-2 bg-white border text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">AWB / Shipment</th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Attempt</th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-right font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading && ndrs.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Loading reports...</td></tr>
                        ) : ndrs.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No pending delivery reports found.</td></tr>
                        ) : (
                            ndrs.map((ndr) => (
                                <tr key={ndr._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{ndr.awb}</div>
                                        <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                                            ID: {ndr.shipmentId.slice(-8)} <ExternalLink size={10} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900">{ndr.ndrReason}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{ndr.ndrReasonText}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">#{ndr.attemptNumber}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            {getStatusIcon(ndr.status)}
                                            <span className={ndr.status === 'RESOLVED' ? 'text-green-700' : 'text-amber-700'}>{ndr.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {format(new Date(ndr.ndrDate), 'MMM d, HH:mm')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {ndr.status !== 'RESOLVED' ? (
                                            <button
                                                onClick={() => openResolveModal(ndr)}
                                                className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-xs font-semibold shadow-sm"
                                            >
                                                Resolve
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Completed</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Resolution Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Resolve Delivery Report</h2>
                                <p className="text-sm text-gray-500 mt-1">Action for AWB: <span className="font-mono text-blue-600">{selectedNdr?.awb}</span></p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">&times;</button>
                        </div>
                        <form onSubmit={handleResolve} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Resolution Type</label>
                                <select
                                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={resolutionData.resolution}
                                    onChange={(e) => setResolutionData({ ...resolutionData, resolution: e.target.value })}
                                >
                                    <option value="RE-ATTEMPT">Request Re-attempt</option>
                                    <option value="ADDRESS-UPDATE">Update Address & Re-attempt</option>
                                    <option value="RTO-CONFIRMED">Confirm Return to Origin (RTO)</option>
                                    <option value="ON-HOLD">Keep On Hold</option>
                                </select>
                            </div>

                            {resolutionData.resolution === 'ADDRESS-UPDATE' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Updated Address Details</label>
                                    <textarea
                                        className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 h-24"
                                        placeholder="Enter the new delivery address provided by the customer..."
                                        value={resolutionData.updatedAddress}
                                        onChange={(e) => setResolutionData({ ...resolutionData, updatedAddress: e.target.value })}
                                    ></textarea>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Internal Notes / Customer Action</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Customer requested after 4 PM"
                                    value={resolutionData.customerAction}
                                    onChange={(e) => setResolutionData({ ...resolutionData, customerAction: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={resolving}
                                    className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 transition-all active:scale-95"
                                >
                                    {resolving ? 'Processing...' : 'Submit Resolution'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
