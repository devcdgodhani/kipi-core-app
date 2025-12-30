import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Shield } from 'lucide-react';
import { authService } from '../../services/auth.service';

const Profile: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // Try fetching from API first for fresh data
            const response = await authService.getMe();
            if (response?.data?.data) {
                setUser(response.data.data);
            } else {
                // Fallback to local storage if API fails or returns no data (though getMe should throw if auth fails)
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
            // Fallback to local storage on error
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <div className="p-10 text-center">User not found</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-primary/5 p-8 border-b border-gray-100 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center text-primary text-3xl font-bold">
                        {user.firstName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{user.firstName} {user.lastName}</h1>
                        <p className="text-gray-500">{user.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-white rounded-full text-xs font-semibold text-primary border border-primary/20">
                            {user.type?.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h2>

                        <div className="flex items-start gap-3 text-gray-600">
                            <User className="mt-1 text-gray-400" size={18} />
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Full Name</p>
                                <p className="text-sm font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-gray-600">
                            <Mail className="mt-1 text-gray-400" size={18} />
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Email Address</p>
                                <p className="text-sm font-medium text-gray-800">{user.email}</p>
                            </div>
                        </div>

                        {user.mobile && (
                            <div className="flex items-start gap-3 text-gray-600">
                                <Phone className="mt-1 text-gray-400" size={18} />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase">Phone Number</p>
                                    <p className="text-sm font-medium text-gray-800">{user.mobile}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Details</h2>

                        <div className="flex items-start gap-3 text-gray-600">
                            <Shield className="mt-1 text-gray-400" size={18} />
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Role</p>
                                <p className="text-sm font-medium text-gray-800 capitalize">{user.type?.replace('_', ' ').toLowerCase()}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-gray-600">
                            <div className="w-4.5"></div> {/* Spacer */}
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Status</p>
                                <p className="text-sm font-medium text-green-600 capitalize">Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
