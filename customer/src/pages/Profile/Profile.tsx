import React, { useEffect, useState } from 'react';
import { authService } from '../../services/auth.service';
import { useAppSelector } from '../../features/hooks';
import { Mail, Phone, User, Loader2 } from 'lucide-react';

const Profile: React.FC = () => {
    const { user: storedUser } = useAppSelector(state => state.auth);
    const [user, setUser] = useState<any>(storedUser || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await authService.getMe();
                if (response?.data?.data) {
                    setUser(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>

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
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-700 border-b border-gray-100 pb-2">Account Status</h3>

                        <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="font-bold text-green-700">Active</span>
                            </div>
                            <p className="text-sm text-green-600/80">Your account is fully verified and active. You have full access to all features.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
