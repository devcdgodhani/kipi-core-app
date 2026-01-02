import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Printer,
    ChevronLeft,
    Mail,
    FileText,
    BadgeCheck,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { orderService } from '../../services/order.service';
import type { Order } from '../../types/order.types';
import { format } from 'date-fns';

const InvoicePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id) {
            loadOrder();
        }
    }, [id]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const data = await orderService.getById(id!);
            setOrder(data);
        } catch (error) {
            console.error('Failed to load order for invoice', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-gray-500 font-medium">Authenticating Invoice Generation...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-white p-6">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                <h1 className="text-xl font-bold">Document Fetch Failure</h1>
                <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-primary text-white rounded-lg font-bold">Return to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100/50 py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between no-print">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold uppercase text-[10px] tracking-widest transition-all"
                >
                    <ChevronLeft size={16} />
                    Exit Preview
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl shadow-gray-200"
                    >
                        <Printer size={16} />
                        Execute Print
                    </button>
                    <button className="p-3 bg-white text-gray-400 hover:text-primary rounded-xl border border-gray-100 hover:border-primary/20 transition-all shadow-sm">
                        <Mail size={20} />
                    </button>
                </div>
            </div>

            {/* Neural Invoice Template */}
            <div
                ref={invoiceRef}
                className="max-w-4xl mx-auto bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-gray-100 p-12 sm:p-20 relative invoice-paper"
            >
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-indigo-500 to-rose-500" />

                {/* Watermark/Logo */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/20">
                                K
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase font-mono">KIPI CORE</h1>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Corporate Node</p>
                            <p className="text-sm font-bold text-gray-600 leading-relaxed max-w-xs">
                                402, Neural Plaza, Silicon Valley,<br />
                                Ahmedabad, Gujarat, IN - 380054
                            </p>
                            <p className="text-xs font-bold text-primary">GSTIN: 24AAACK1234F1Z5</p>
                        </div>
                    </div>

                    <div className="text-right space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm mb-4">
                            <BadgeCheck size={14} />
                            Verified Settlement
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase font-mono">Tax Invoice</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Registry</p>
                        </div>
                    </div>
                </div>

                {/* Meta Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 py-8 border-y border-gray-100">
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Invoice Entity</p>
                        <div>
                            <p className="text-sm font-black text-gray-900 uppercase">#{order.orderNumber}</p>
                            <p className="text-xs font-bold text-gray-500 mt-1">{format(new Date(order.createdAt), 'MMMM dd, yyyy')}</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Client Identity</p>
                        <div>
                            <p className="text-sm font-black text-gray-900 uppercase">{order.shippingAddress.name}</p>
                            <p className="text-xs font-bold text-gray-500 mt-1">{order.shippingAddress.mobile}</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Protocol</p>
                        <div>
                            <p className="text-sm font-black text-gray-900 uppercase">{order.paymentMethod}</p>
                            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest text-emerald-500">{order.paymentStatus}</p>
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="mb-20">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-900">
                                <th className="py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Manifest Item</th>
                                <th className="py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</th>
                                <th className="py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate</th>
                                <th className="py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {order.items.map((item, idx) => (
                                <tr key={idx} className="group">
                                    <td className="py-6 pr-4">
                                        <p className="text-sm font-black text-gray-900 uppercase leading-tight mb-1">{item.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">REF: SKU-{(item.skuId as any)?.toString().slice(-6).toUpperCase()}</p>
                                    </td>
                                    <td className="py-6 text-center text-sm font-bold text-gray-600">{item.quantity}</td>
                                    <td className="py-6 text-right text-sm font-bold text-gray-600">₹{item.price.toLocaleString()}</td>
                                    <td className="py-6 text-right text-sm font-black text-gray-900">₹{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Financial Calculus Section */}
                <div className="flex flex-col md:flex-row justify-between gap-12 pt-12 border-t border-gray-100">
                    <div className="md:w-1/2 space-y-6">
                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Billing Nexus</h3>
                            <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase">
                                {order.shippingAddress.street}, {order.shippingAddress.landmark && `${order.shippingAddress.landmark}, `}
                                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 px-6 py-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <FileText size={18} className="text-primary" />
                            <p className="text-[10px] font-bold text-primary/70 uppercase leading-relaxed tracking-wider">
                                This is a digitally generated credential and does not require a physical signature for verification.
                            </p>
                        </div>
                    </div>

                    <div className="md:w-1/3 space-y-4">
                        <div className="flex justify-between items-center text-sm text-gray-500 font-medium">
                            <span className="uppercase tracking-widest text-[10px] font-black">Gross Settlement</span>
                            <span className="font-bold text-gray-900">₹{order.subTotal.toLocaleString()}</span>
                        </div>
                        {order.discountAmount! > 0 && (
                            <div className="flex justify-between items-center text-sm text-rose-500 font-medium">
                                <span className="uppercase tracking-widest text-[10px] font-black">Rebate Applied</span>
                                <span className="font-black">-₹{order.discountAmount!.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-sm text-gray-500 font-medium pb-4">
                            <span className="uppercase tracking-widest text-[10px] font-black">Logistics Fee</span>
                            <span className="font-bold text-gray-900">{order.shippingCost === 0 ? 'COMPLIMENTARY' : `₹${order.shippingCost.toLocaleString()}`}</span>
                        </div>
                        <div className="flex justify-between items-center p-6 bg-gray-900 text-white rounded-[2rem] shadow-xl shadow-gray-200">
                            <span className="text-[10px] font-black uppercase tracking-widest">Net Total</span>
                            <div className="text-right">
                                <p className="text-2xl font-black tracking-tight leading-none">₹{order.totalAmount.toLocaleString()}</p>
                                <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest mt-1">Currency: INR</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="mt-20 text-center space-y-2 border-t border-gray-50 pt-12">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Neural Commerce Network &copy; 2026</p>
                    <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Protocol-Secured Node Environment</p>
                </div>
            </div>

            <style>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body {
                        background-color: white !important;
                        -webkit-print-color-adjust: exact;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .invoice-paper {
                        box-shadow: none !important;
                        border: none !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 2cm !important;
                        margin: 0 !important;
                        border-radius: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoicePage;
