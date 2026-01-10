import React, { useEffect, useState } from 'react';
import { whatsappContactService, type IWhatsAppContact } from '../../services/whatsappContactService';
import { Check, X, Ban, RefreshCw } from 'lucide-react';

const WhatsAppContacts: React.FC = () => {
    const [contacts, setContacts] = useState<IWhatsAppContact[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response: any = await whatsappContactService.getAll();
            setContacts(response.data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleConsent = async (id: string, consent: boolean) => {
        try {
            await whatsappContactService.updateConsent(id, consent);
            fetchContacts();
        } catch (error) {
            alert('Error updating consent');
        }
    };

    const handleDND = async (id: string) => {
        if (confirm('Mark this contact as DND? This cannot be undone easily.')) {
            try {
                await whatsappContactService.markAsDND(id);
                fetchContacts();
            } catch (error) {
                alert('Error marking DND');
            }
        }
    };

    if (loading) return <div className="p-6">Loading contacts...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black uppercase tracking-tight">Contacts</h1>
                <button onClick={fetchContacts} className="p-2 hover:bg-gray-100 rounded-full">
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">State</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Consent</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Replies</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Interaction</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(contacts || []).map((contact) => (
                                <tr key={contact._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        {contact.mobile}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${contact.state === 'ENGAGED' ? 'bg-purple-100 text-purple-700' :
                                            contact.state === 'DND' ? 'bg-gray-100 text-gray-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {contact.state}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {contact.consent ? (
                                            <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                                                <Check className="w-4 h-4" /> Granted
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-rose-600 text-sm font-medium">
                                                <X className="w-4 h-4" /> Missing
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {contact.totalReplies}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {contact.lastRepliedAt ? new Date(contact.lastRepliedAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                        <button
                                            onClick={() => handleConsent(contact._id, !contact.consent)}
                                            className={`p-2 rounded-lg transition-colors ${contact.consent ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                                                }`}
                                            title={contact.consent ? "Revoke Consent" : "Grant Consent"}
                                        >
                                            {contact.consent ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDND(contact._id)}
                                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Mark DND"
                                        >
                                            <Ban className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppContacts;
