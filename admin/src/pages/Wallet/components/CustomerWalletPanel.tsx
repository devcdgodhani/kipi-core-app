import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Minus,
    History,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    ChevronRight
} from 'lucide-react';
import { walletService } from '../../../services/wallet.service';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Button from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import CustomInput from '../../../components/common/Input';

interface CustomerWalletPanelProps {
    userId: string;
}

const CustomerWalletPanel: React.FC<CustomerWalletPanelProps> = ({ userId }) => {
    const navigate = useNavigate();
    const [wallet, setWallet] = useState<any>(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [modalType, setModalType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const response = await walletService.getWalletByUserId(userId);
            const walletData = response?.data || response;
            setWallet(walletData);

            const txRes = await walletService.getTransactions({
                filter: { userId },
                limit: 5,
                page: 1,
                sort: { createdAt: -1 }
            });
            const txData = txRes?.data?.recordList || txRes?.recordList || [];
            setTransactions(txData);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchWalletData();
        }
    }, [userId]);

    const handleAction = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (!description) {
            toast.error('Description is required');
            return;
        }

        try {
            setActionLoading(true);
            const payload = {
                userId,
                amount: Number(amount),
                description
            };

            if (modalType === 'CREDIT') {
                await walletService.manualCredit(payload);
                toast.success('Wallet credited successfully');
            } else {
                await walletService.manualDebit(payload);
                toast.success('Wallet debited successfully');
            }
            setOpenModal(false);
            setAmount('');
            setDescription('');
            fetchWalletData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Transaction failed');
        } finally {
            setActionLoading(false);
        }
    };

    const openActionModal = (type: 'CREDIT' | 'DEBIT') => {
        setModalType(type);
        setOpenModal(true);
    };

    if (loading && !wallet) return <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Wallet...</div>;

    if (!wallet) return (
        <div className="mt-8 p-12 bg-gray-50 border border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Wallet size={32} className="text-gray-300" />
            </div>
            <div>
                <p className="font-black text-gray-900 uppercase tracking-tight">No Wallet Found</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Initialize wallet to start managing rewards</p>
            </div>
            <Button onClick={fetchWalletData} className="mt-2 h-10 px-6 rounded-xl bg-gray-900 text-white font-black uppercase tracking-widest text-[10px]">
                Initialize Wallet
            </Button>
        </div>
    );

    return (
        <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                        <Wallet size={20} />
                    </div>
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Customer Wallet</h2>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Balance</p>
                        <h3 className="text-4xl font-black text-primary tracking-tighter">₹{wallet.availableBalance.toFixed(2)}</h3>
                    </div>

                    <div className="space-y-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Locked Amount</p>
                        <p className="text-xl font-black text-gray-900">₹{wallet.blockedBalance.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => openActionModal('CREDIT')}
                            className="flex-1 h-12 bg-green-50 text-green-600 hover:bg-green-100 border-green-100 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                        >
                            <Plus size={14} />
                            Credit
                        </Button>
                        <Button
                            onClick={() => openActionModal('DEBIT')}
                            className="flex-1 h-12 bg-red-50 text-red-600 hover:bg-red-100 border-red-100 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                        >
                            <Minus size={14} />
                            Debit
                        </Button>
                    </div>
                </div>

                <div className="h-px bg-gray-50 my-8" />

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <History size={14} className="text-gray-400" />
                            Recent Activity
                        </h4>
                        <button
                            onClick={() => navigate(`/wallet/transactions?userId=${userId}`)}
                            className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                        >
                            View All <ChevronRight size={12} />
                        </button>
                    </div>

                    <div className="overflow-hidden border border-gray-100 rounded-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                    <th className="py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                    <th className="py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Validity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.map((tx: any) => (
                                    <tr key={tx._id} className="group hover:bg-gray-50/30 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900">{format(new Date(tx.createdAt), 'dd MMM, yy')}</span>
                                                <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">{format(new Date(tx.createdAt), 'HH:mm')}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                {tx.transactionType === 'CREDIT' ? (
                                                    <div className="w-6 h-6 bg-green-50 text-green-500 rounded-lg flex items-center justify-center">
                                                        <ArrowUpRight size={14} />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                                                        <ArrowDownLeft size={14} />
                                                    </div>
                                                )}
                                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{tx.sourceType}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <span className={`text-xs font-black ${tx.transactionType === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.transactionType === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[8px] font-black uppercase tracking-tighter border border-gray-200">
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {tx.transactionType === 'CREDIT' && tx.expiryDate ? (
                                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">
                                                    {format(new Date(tx.expiryDate), 'dd MMM, yy')}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-medium text-gray-300 uppercase tracking-widest">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            No recent activity
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            <Modal isOpen={openModal} onClose={() => setOpenModal(false)} title={modalType === 'CREDIT' ? 'Manual Credit' : 'Manual Debit'}>
                <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${modalType === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {modalType === 'CREDIT' ? <Plus size={24} /> : <Minus size={24} />}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjust user balance manually</p>
                            <p className="text-xs font-bold text-gray-900 uppercase tracking-tight">Manual {modalType.toLowerCase()} operation</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <CustomInput
                            label="Amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            icon={<span className="text-xs font-black">₹</span>}
                            autoFocus
                        />
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-sm font-semibold text-primary/80">Description / Reason</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Why are you adjusting the balance?"
                                rows={3}
                                className="w-full border border-primary/20 bg-primary/5 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            onClick={() => setOpenModal(false)}
                            className="px-6 py-2.5 rounded-xl font-black text-gray-400 hover:text-gray-900 transition-all text-[10px] uppercase tracking-widest border border-transparent hover:border-gray-100"
                        >
                            Cancel
                        </button>
                        <Button
                            onClick={handleAction}
                            isLoading={actionLoading}
                            className={`min-w-[140px] h-12 rounded-xl text-white font-black uppercase tracking-widest text-xs shadow-lg ${modalType === 'CREDIT' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
                        >
                            Process {modalType}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CustomerWalletPanel;
