import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Webhook,
    Search,
    Filter,
    RotateCcw,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ChevronRight,
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import type { WebhookLog } from '../../types/payment';
import toast from 'react-hot-toast';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { PopupModal } from '../../components/common/PopupModal';
import { Modal } from '../../components/common/Modal';
import Button from '../../components/common/Button';

const WebhookLogList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [logs, setLogs] = useState<WebhookLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1
    });
    const [popup, setPopup] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'alert' | 'confirm' | 'prompt';
        onConfirm: () => void;
        loading?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        onConfirm: () => { }
    });

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const provider = searchParams.get('provider') || '';
    const status = searchParams.get('status') || '';
    const eventType = searchParams.get('eventType') || '';

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const filters = {
                provider,
                status,
                eventType,
                limit,
                page
            };

            const response = await paymentService.getWebhookLogs(filters);
            const paginationData = response.data;

            setLogs(paginationData?.recordList || []);
            setPagination({
                totalRecords: paginationData?.totalRecords || 0,
                totalPages: paginationData?.totalPages || 0,
                currentPage: page
            });
        } catch (error: any) {
            console.error('Error fetching webhook logs:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch webhook logs');
        } finally {
            setLoading(false);
        }
    }, [provider, status, eventType, page, limit]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchLogs]);

    const handleRetry = async (id: string) => {
        setPopup({
            isOpen: true,
            title: 'Retry Webhook',
            message: 'Are you sure you want to retry processing this webhook? This will attempt to reprocess the webhook event.',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await paymentService.retryWebhook(id);
                    toast.success('Webhook retry initiated successfully');
                    fetchLogs();
                    setPopup(prev => ({ ...prev, isOpen: false, loading: false }));
                } catch (error: any) {
                    setPopup({
                        isOpen: true,
                        title: 'Error',
                        message: error.response?.data?.message || 'Failed to retry webhook',
                        type: 'alert',
                        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const handleFilterChange = (updatedFilters: Record<string, any>) => {
        setSearchParams(prev => {
            Object.keys(updatedFilters).forEach(key => {
                if (updatedFilters[key]) {
                    prev.set(key, updatedFilters[key]);
                } else {
                    prev.delete(key);
                }
            });
            prev.set('page', '1'); // Reset to first page
            return prev;
        });
    };

    const handleLimitChange = (newLimit: number) => {
        setSearchParams(prev => {
            prev.set('limit', newLimit.toString());
            prev.set('page', '1');
            return prev;
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'FAILED': return 'bg-rose-50 text-rose-500 border-rose-100';
            case 'PROCESSING': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS': return <CheckCircle2 size={14} />;
            case 'FAILED': return <AlertTriangle size={14} />;
            case 'PROCESSING': return <Clock size={14} />;
            default: return null;
        }
    };

    const filterFields: FilterField[] = [
        {
            key: 'provider',
            label: 'Provider',
            type: 'select',
            options: [
                { label: 'PhonePe', value: 'phonepe' },
                { label: 'Razorpay', value: 'razorpay' },
                { label: 'Paytm', value: 'paytm' }
            ]
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { label: 'Success', value: 'SUCCESS' },
                { label: 'Failed', value: 'FAILED' },
                { label: 'Processing', value: 'PROCESSING' }
            ]
        }
    ];

    const activeFilterCount = [provider, status, eventType].filter(Boolean).length;

    const columns: Column<WebhookLog>[] = [
        {
            header: 'Event Info',
            key: 'event',
            render: (log) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center text-purple-600 border border-purple-500/10 shadow-inner">
                        <Webhook size={20} />
                    </div>
                    <div className="flex flex-col max-w-[200px]">
                        <span className="font-bold text-gray-900 leading-tight text-sm truncate">{log.eventId}</span>
                        <span className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">{log.eventType}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Provider',
            key: 'provider',
            render: (log) => (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border bg-primary/5 text-primary border-primary/10">
                    {log.provider}
                </span>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (log) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border inline-flex items-center gap-1.5 ${getStatusColor(log.status)}`}>
                    {getStatusIcon(log.status)}
                    {log.status}
                </span>
            )
        },
        {
            header: 'Processing Time',
            key: 'processingTime',
            render: (log) => (
                <div className="flex flex-col">
                    {log.processingTime ? (
                        <>
                            <span className="text-sm font-bold text-gray-900">{log.processingTime}ms</span>
                            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Duration</span>
                        </>
                    ) : (
                        <span className="text-xs text-gray-400 italic">N/A</span>
                    )}
                </div>
            )
        },
        {
            header: 'Retry Count',
            key: 'retryCount',
            render: (log) => (
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${log.retryCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                        <span className={`text-sm font-black ${log.retryCount > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{log.retryCount}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Timestamp',
            key: 'createdAt',
            render: (log) => (
                <span className="text-xs font-semibold text-gray-500">
                    {new Date(log.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            )
        },
        {
            header: 'Action',
            key: 'actions',
            align: 'right',
            render: (log) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                        }}
                        className="p-3 text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 group"
                        title="View Details"
                    >
                        <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    {log.status !== 'SUCCESS' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRetry(log._id);
                            }}
                            className="p-3 text-blue-500 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100 group"
                            title="Retry Webhook"
                        >
                            <RefreshCw size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    const successCount = logs.filter(log => log.status === 'SUCCESS').length;
    const failedCount = logs.filter(log => log.status === 'FAILED').length;
    const processingCount = logs.filter(log => log.status === 'PROCESSING').length;

    return (
        <div className="p-6 space-y-6">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                        <Webhook size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Webhook Logs</h1>
                        <p className="text-sm text-gray-500 font-medium">Monitor payment gateway webhook events and processing status</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex flex-col items-center">
                        <span className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest leading-none mb-0.5">Success</span>
                        <span className="text-xl font-black text-emerald-600">{successCount}</span>
                    </div>
                    <div className="bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 flex flex-col items-center">
                        <span className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest leading-none mb-0.5">Failed</span>
                        <span className="text-xl font-black text-rose-500">{failedCount}</span>
                    </div>
                    <div className="bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100 flex flex-col items-center">
                        <span className="text-[9px] font-black text-yellow-600/60 uppercase tracking-widest leading-none mb-0.5">Processing</span>
                        <span className="text-xl font-black text-yellow-600">{processingCount}</span>
                    </div>
                </div>
            </div>

            {/* Advanced Search & Filtering */}
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Search by event type..."
                        value={eventType}
                        onChange={(e) => setSearchParams(prev => {
                            if (e.target.value) prev.set('eventType', e.target.value);
                            else prev.delete('eventType');
                            prev.set('page', '1');
                            return prev;
                        })}
                        className="w-full bg-white border-2 border-primary/5 rounded-[2rem] py-5 pl-16 pr-6 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50 h-16 placeholder:text-gray-300"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`px-8 py-4 rounded-[2rem] border-2 flex items-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest h-16 ${activeFilterCount > 0
                            ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30'
                            : 'bg-white border-primary/5 text-primary hover:bg-primary/5 hover:border-primary/10 shadow-xl shadow-gray-100/30'
                            }`}
                    >
                        <Filter size={18} />
                        Intelligence Filter
                        {activeFilterCount > 0 && (
                            <span className="w-6 h-6 bg-white text-primary rounded-full flex items-center justify-center text-[10px] font-black shadow-inner">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => setSearchParams({ page: '1', limit: limit.toString() })}
                            className="px-8 h-16 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50"
                        >
                            <RotateCcw size={18} />
                            Reset
                        </button>
                    )}

                    <div className="flex items-center gap-3 bg-white border-2 border-primary/5 rounded-[2rem] px-6 py-2 shadow-xl shadow-gray-100/30 h-16">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Viewport</span>
                        <select
                            value={limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="bg-transparent focus:outline-none font-black text-primary cursor-pointer text-sm outline-none border-none"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            </div>

            <CommonFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                fields={filterFields}
                onApply={handleFilterChange}
                currentFilters={{ provider, status }}
            />

            <div className="space-y-4">
                <Table
                    data={logs}
                    columns={columns}
                    isLoading={loading}
                    keyExtractor={(log) => log._id}
                    emptyMessage="No webhook logs found"
                    pagination={pagination.totalRecords > 0 ? {
                        currentPage: pagination.currentPage,
                        totalPages: pagination.totalPages,
                        totalRecords: pagination.totalRecords,
                        pageSize: limit,
                        onPageChange: (p) => setSearchParams(prev => { prev.set('page', p.toString()); return prev; }),
                        hasPreviousPage: pagination.currentPage > 1,
                        hasNextPage: pagination.currentPage < pagination.totalPages
                    } : undefined}
                />

                {/* Webhook Details Modal */}
                <Modal
                    isOpen={!!selectedLog}
                    onClose={() => setSelectedLog(null)}
                    title="Webhook Event Insights"
                    maxWidth="max-w-4xl"
                >
                    {selectedLog && (
                        <div className="space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Event Type</span>
                                    <span className="text-sm font-black text-gray-900 break-all">{selectedLog.eventType}</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Provider</span>
                                    <span className="text-sm font-black text-primary uppercase">{selectedLog.provider}</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Status</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedLog.status)}`}>
                                        {selectedLog.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Payload Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Transaction Payload</h4>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute top-4 right-4 z-10">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(JSON.stringify(selectedLog.payload, null, 2));
                                                    toast.success('Payload copied to clipboard');
                                                }}
                                                className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm text-[10px] font-black text-gray-500 hover:text-primary transition-colors uppercase tracking-widest"
                                            >
                                                Copy JSON
                                            </button>
                                        </div>
                                        <pre className="bg-gray-900 text-gray-300 p-6 rounded-[1.5rem] border border-gray-800 overflow-x-auto text-[11px] font-mono leading-relaxed h-[400px] shadow-inner scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                                            {JSON.stringify(selectedLog.payload, null, 2)}
                                        </pre>
                                    </div>
                                </div>

                                {/* Response & Error Section */}
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                                            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Processing Headers</h4>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 max-h-[150px] overflow-y-auto">
                                            <pre className="text-[10px] font-mono text-gray-600 leading-tight">
                                                {JSON.stringify(selectedLog.headers, null, 2)}
                                            </pre>
                                        </div>
                                    </div>

                                    {selectedLog.error && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 px-1">
                                                <div className="w-1.5 h-4 bg-rose-500 rounded-full"></div>
                                                <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest">Failure Diagnostics</h4>
                                            </div>
                                            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 font-mono text-xs text-rose-800 leading-relaxed shadow-sm">
                                                <p className="font-black mb-2 uppercase tracking-tight">Root Cause:</p>
                                                {selectedLog.error}
                                                {selectedLog.errorStack && (
                                                    <pre className="mt-4 pt-4 border-t border-rose-200/50 text-[10px] opacity-70 whitespace-pre-wrap max-h-[100px] overflow-y-auto">
                                                        {selectedLog.errorStack}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {!selectedLog.error && selectedLog.status === 'SUCCESS' && (
                                        <div className="p-10 flex flex-col items-center justify-center text-center space-y-4 bg-emerald-50/30 rounded-[2rem] border-2 border-dashed border-emerald-100">
                                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                                                <CheckCircle2 size={32} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-emerald-700 uppercase tracking-widest">Integrity Verified</p>
                                                <p className="text-[10px] font-bold text-emerald-600/70 mt-1 italic uppercase tracking-[0.1em]">Event processed successfully with zero discrepancies</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Event ID</span>
                                    <span className="text-xs font-bold text-gray-500 font-mono tracking-tighter">{selectedLog.eventId}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setSelectedLog(null)}
                                        className="h-12 rounded-xl text-gray-500 font-black uppercase text-[10px] tracking-widest"
                                    >
                                        Dismiss
                                    </Button>
                                    {selectedLog.status !== 'SUCCESS' && (
                                        <Button
                                            onClick={() => {
                                                handleRetry(selectedLog._id);
                                                setSelectedLog(null);
                                            }}
                                            className="h-12 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 font-black uppercase text-[10px] tracking-widest"
                                        >
                                            <RefreshCw size={14} className="mr-2" />
                                            Re-process Event
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>

            <PopupModal
                isOpen={popup.isOpen}
                onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                onConfirm={popup.onConfirm}
                loading={popup.loading}
            />
        </div>
    );
};

export default WebhookLogList;
