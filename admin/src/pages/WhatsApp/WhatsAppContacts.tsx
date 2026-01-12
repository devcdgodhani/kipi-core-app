
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { whatsappContactService, type IWhatsAppContact } from '../../services/whatsappContactService';
import { Check, X, Ban, RefreshCw, Trash2, Users, Filter, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PopupModal } from '../../components/common/PopupModal';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';

const WhatsAppContacts: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [contacts, setContacts] = useState<IWhatsAppContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [isDNDModalOpen, setIsDNDModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [contactToMarkDND, setContactToMarkDND] = useState<string | null>(null);
    const [contactToDelete, setContactToDelete] = useState<string | null>(null);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const state = searchParams.get('state');
    const consent = searchParams.get('consent');

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const filter: any = {};
            if (state) filter.state = state;
            if (consent !== null && consent !== undefined) {
                if (consent === 'true') filter.consent = true;
                if (consent === 'false') filter.consent = false;
            }

            const response: any = await whatsappContactService.getWithPagination({
                page,
                limit,
                filter,
                sort: { 'metadata.firstContactedAt': -1 }
            });

            const data = response.data || response;
            if (data) {
                setContacts(data.recordList || []);
                setTotalRecords(data.totalRecords || 0);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to fetch contacts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [page, state, consent]);

    const handleApplyFilters = (filters: Record<string, any>) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '1');

            if (filters.state) newParams.set('state', filters.state);
            else newParams.delete('state');

            if (filters.consent !== undefined) newParams.set('consent', filters.consent.toString());
            else newParams.delete('consent');

            return newParams;
        });
    };

    const handleReset = () => {
        setSearchParams({});
    };

    const handleConsent = async (id: string, currentConsent: boolean) => {
        try {
            await whatsappContactService.updateConsent(id, !currentConsent);
            fetchContacts();
            toast.success('Consent updated successfully');
        } catch (error) {
            toast.error('Error updating consent');
        }
    };

    const handleDND = (id: string) => {
        setContactToMarkDND(id);
        setIsDNDModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setContactToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDND = async () => {
        if (!contactToMarkDND) return;
        try {
            await whatsappContactService.markAsDND(contactToMarkDND);
            fetchContacts();
            toast.success('Contact marked as DND');
        } catch (error) {
            toast.error('Error marking DND');
        } finally {
            setIsDNDModalOpen(false);
            setContactToMarkDND(null);
        }
    };

    const confirmDelete = async () => {
        if (!contactToDelete) return;
        try {
            await whatsappContactService.deleteByFilter({ _id: contactToDelete });
            fetchContacts();
            toast.success('Contact deleted successfully');
        } catch (error) {
            toast.error('Error deleting contact');
        } finally {
            setIsDeleteModalOpen(false);
            setContactToDelete(null);
        }
    };

    const filterFields: FilterField[] = [
        {
            key: 'state',
            label: 'Contact State',
            type: 'select',
            options: [
                { label: 'New', value: 'NEW' },
                { label: 'Engaged', value: 'ENGAGED' },
                { label: 'DND', value: 'DND' }
            ]
        },
        {
            key: 'consent',
            label: 'Consent Status',
            type: 'boolean',
            options: [
                { label: 'Granted', value: true },
                { label: 'Missing', value: false }
            ]
        }
    ];

    const currentFilters = {
        state: state,
        consent: consent === 'true' ? true : consent === 'false' ? false : undefined
    };

    const columns: Column<IWhatsAppContact>[] = [
        {
            header: 'Identity',
            render: (contact) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                        <Users size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 tracking-tight font-mono">{contact.mobile}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Contact Method: WhatsApp</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Status & State',
            render: (contact) => (
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${contact.state === 'ENGAGED' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            contact.state === 'DND' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                        {contact.state}
                    </span>
                </div>
            )
        },
        {
            header: 'Consent',
            render: (contact) => (
                <div className="flex items-center gap-1.5">
                    {contact.consent ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100/50">
                            <Check size={12} strokeWidth={4} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Granted</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-2 py-1 rounded-md border border-rose-100/50">
                            <X size={12} strokeWidth={4} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Missing</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Interaction History',
            render: (contact) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">
                        Replies: <span className="text-primary font-black ml-1">{contact.totalReplies}</span>
                    </div>
                    <div className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">
                        Last Active: {contact.lastRepliedAt ? new Date(contact.lastRepliedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                    </div>
                </div>
            )
        },
        {
            header: 'Discovery',
            render: (contact) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-600">
                        {new Date(contact.metadata.firstContactedAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Incept Date</span>
                </div>
            )
        },
        {
            header: 'Actions',
            align: 'right',
            render: (contact) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => handleConsent(contact._id, contact.consent)}
                        className={`p-2 rounded-xl border transition-all ${contact.consent
                                ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                            }`}
                        title={contact.consent ? "Revoke Consent" : "Grant Consent"}
                    >
                        {contact.consent ? <X size={16} /> : <Check size={16} />}
                    </button>
                    <button
                        onClick={() => handleDND(contact._id)}
                        className="p-2 bg-gray-50 text-gray-400 border border-gray-100 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all"
                        title="Mark DND"
                    >
                        <Ban size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(contact._id)}
                        className="p-2 bg-rose-50 text-rose-400 border border-rose-100 rounded-xl hover:bg-rose-100 hover:text-rose-600 transition-all"
                        title="Purge Record"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <Users size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Communications Hub</h1>
                        <p className="text-sm text-gray-500 font-medium">Manage WhatsApp contact repository and consent</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-4">
                    <button
                        onClick={() => fetchContacts()}
                        className="bg-white text-gray-400 hover:text-primary border-2 border-primary/5 h-14 w-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-gray-100/50"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="flex-1 w-full xl:w-auto" />

                <div className="flex flex-wrap gap-3 w-full xl:w-auto h-full items-center justify-end">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`px-8 h-16 rounded-[2rem] border-2 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl ${(state || consent)
                                ? 'bg-primary text-white border-primary shadow-primary/20 hover:bg-primary/90'
                                : 'bg-white border-primary/5 text-gray-400 hover:border-primary/20 hover:text-primary shadow-gray-100/50'
                            }`}
                    >
                        <Filter size={18} />
                        {(state || consent) ? 'Filters Active' : 'Refine Hub'}
                    </button>

                    {(state || consent) && (
                        <button
                            onClick={handleReset}
                            className="px-8 h-16 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50"
                        >
                            <RotateCcw size={18} />
                            Reset Hub
                        </button>
                    )}
                </div>
            </div>

            <Table
                data={contacts}
                columns={columns}
                isLoading={loading}
                keyExtractor={(item) => item._id}
                emptyMessage="No contacts discovered in the communication matrix"
                pagination={totalRecords > 0 ? {
                    currentPage: page,
                    totalPages: Math.ceil(totalRecords / limit),
                    totalRecords: totalRecords,
                    pageSize: limit,
                    onPageChange: (p) => setSearchParams(prev => { prev.set('page', p.toString()); return prev; }),
                    hasPreviousPage: page > 1,
                    hasNextPage: page < Math.ceil(totalRecords / limit)
                } : undefined}
            />

            <CommonFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                fields={filterFields}
                onApply={handleApplyFilters}
                currentFilters={currentFilters}
            />

            {isDNDModalOpen && (
                <PopupModal
                    isOpen={isDNDModalOpen}
                    onClose={() => {
                        setIsDNDModalOpen(false);
                        setContactToMarkDND(null);
                    }}
                    title="Confirm DND"
                    message="Mark this contact as DND? This will suspend all outbound communications."
                    type="confirm"
                    onConfirm={confirmDND}
                    confirmLabel="Apply DND"
                    cancelLabel="Cancel"
                />
            )}
            {isDeleteModalOpen && (
                <PopupModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setContactToDelete(null);
                    }}
                    title="Purge Record"
                    message="Are you sure you want to permanently erase this contact? This procedure is irreversible."
                    type="confirm"
                    onConfirm={confirmDelete}
                    confirmLabel="Purge Now"
                    cancelLabel="Cancel"
                />
            )}
        </div>
    );
};

export default WhatsAppContacts;
