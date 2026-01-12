import React, { useEffect, useState } from 'react';
import { authService } from '../../services/auth.service';
import { walletService } from '../../services/wallet.service';
import { useAppSelector } from '../../features/hooks';
import { Mail, Phone, User, Loader2, Cake, Wallet, ChevronRight } from 'lucide-react';

const Profile: React.FC = () => {
    const { user: storedUser } = useAppSelector(state => state.auth);
    const [user, setUser] = useState<any>(storedUser || null);
    const [wallet, setWallet] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileRes, walletRes] = await Promise.all([
                    authService.getMe(),
                    walletService.getMyWallet()
                ]);

                // profileRes is root JSON { success: true, data: { ...user } }
                if (profileRes?.data) {
                    setUser(profileRes.data);
                } else if (profileRes) {
                    setUser(profileRes);
                }

                // walletRes is already unwrapped wallet object because getMyWallet returns response.data
                setWallet(walletRes);
            } catch (error) {
                console.error('Failed to fetch profile/wallet', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading && !user) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (!user) {
        return <div className="text-center py-20 text-gray-500">Failed to load profile.</div>;
    }

    const { firstName, lastName, email, mobile, type } = user;
    const initials = firstName ? firstName.charAt(0).toUpperCase() : 'U';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center text-3xl font-bold text-primary">
                        {initials}
                    </div>
                    <div className="text-center sm:text-left space-y-2">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{firstName} {lastName}</h2>
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mt-2 uppercase tracking-wide">
                                {type?.replace('_', ' ')} Account
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-700 border-b border-gray-100 pb-2">Personal Information</h3>

                        <div className="flex items-center gap-4 text-gray-600 p-4 bg-gray-50/50 rounded-2xl">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</p>
                                <p className="font-semibold text-gray-800">{firstName} {lastName}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-gray-600 p-4 bg-gray-50/50 rounded-2xl">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</p>
                                <p className="font-semibold text-gray-800">{email}</p>
                            </div>
                        </div>

                        {mobile && (
                            <div className="flex items-center gap-4 text-gray-600 p-4 bg-gray-50/50 rounded-2xl">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</p>
                                    <p className="font-semibold text-gray-800">{mobile}</p>
                                </div>
                            </div>
                        )}

                        {user.dob && (
                            <div className="flex items-center gap-4 text-gray-600 p-4 bg-gray-50/50 rounded-2xl">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                    <Cake size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Birthday</p>
                                    <p className="font-semibold text-gray-800">{new Date(user.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-700 border-b border-gray-100 pb-2">Status & Rewards</h3>

                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 group hover:bg-primary/10 transition-colors duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                    <Wallet size={18} />
                                </div>
                                <span className="font-bold text-gray-700">Digital Wallet</span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{wallet?.availableBalance || 0}</p>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-3">Available Balance</p>

                            <button
                                onClick={() => window.location.href = '/wallet'}
                                className="text-[10px] text-primary/60 font-bold uppercase tracking-widest flex items-center gap-1 bg-white/50 w-fit px-2 py-1 rounded-lg hover:bg-white hover:text-primary transition-colors"
                            >
                                View Transactions <ChevronRight size={10} />
                            </button>
                        </div>

                        <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="font-bold text-green-700 uppercase text-xs tracking-widest">Account Status: Active</span>
                            </div>
                            <p className="text-xs text-green-600/80 font-medium leading-relaxed">Your account is fully verified and active. You have full access to all features.</p>
                        </div>

                        <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="font-bold text-purple-700 uppercase text-xs tracking-widest">Your Referral Code</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-purple-200">
                                <span className="font-mono text-xl font-black text-purple-700 tracking-wider uppercase">{user.referralCode}</span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(user.referralCode);
                                        // Optional: add a toast or simple feedback
                                    }}
                                    className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                            <p className="mt-4 text-[10px] text-purple-600 font-bold uppercase tracking-widest">Share this code with friends to earn rewards!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
