import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { userService } from '../../services/user.service';
import { USER_STATUS, USER_TYPE, GENDER } from '../../types/user';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { ROUTES } from '../../routes/routeConfig';

const UserForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const [formData, setFormData] = useState<{
        firstName: string;
        lastName: string;
        email: string;
        mobile: string;
        countryCode: string;
        password: string;
        type: USER_TYPE;
        gender: GENDER;
        status: USER_STATUS;
        isEmailVerified: boolean;
        isMobileVerified: boolean;
        isVerified: boolean;
    }>({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        countryCode: '+91',
        password: '',
        type: USER_TYPE.CUSTOMER,
        gender: GENDER.NONE,
        status: USER_STATUS.ACTIVE,
        isEmailVerified: false,
        isMobileVerified: false,
        isVerified: false,
    });
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!isEdit) return;
            setPageLoading(true);
            try {
                const userRes = await userService.getOne(id!);
                if (userRes?.data) {
                    const user = userRes.data;
                    setFormData({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        mobile: user.mobile,
                        countryCode: user.countryCode || '+91',
                        password: '', // Don't fill password
                        type: user.type,
                        gender: user.gender || GENDER.NONE,
                        status: user.status,
                        isEmailVerified: user.isEmailVerified,
                        isMobileVerified: user.isMobileVerified,
                        isVerified: user.isVerified,
                    });
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch user details');
            } finally {
                setPageLoading(false);
            }
        };
        fetchUser();
    }, [id, isEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as any).checked : value
        }));
    };

    const handleToggle = (name: string) => {
        setFormData(prev => ({ ...prev, [name]: !((prev as any)[name]) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEdit) {
                const updatePayload = { ...formData };
                if (!updatePayload.password) delete (updatePayload as any).password;
                await userService.update(id!, updatePayload as any);
            } else {
                await userService.create(formData as any);
            }
            navigate('/' + ROUTES.DASHBOARD.USERS);
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return <div className="p-8 text-center text-gray-500 font-bold">Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">{isEdit ? 'Edit Member Profile' : 'Add New Member'}</h1>
                    <p className="text-sm text-gray-500 font-medium">{isEdit ? 'Update user details and permissions' : 'Onboard a new user to the platform'}</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl text-center font-bold uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <CustomInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required />
                        <CustomInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required />
                    </div>

                    <CustomInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john.doe@example.com" required />

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4">
                            <CustomInput label="CC" name="countryCode" value={formData.countryCode} onChange={handleChange} placeholder="+91" required />
                        </div>
                        <div className="col-span-8">
                            <CustomInput label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="9876543210" required />
                        </div>
                    </div>

                    {!isEdit && (
                        <CustomInput label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" required />
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">User Role</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700"
                            >
                                <option value={USER_TYPE.CUSTOMER}>Customer</option>
                                <option value={USER_TYPE.ADMIN}>Admin</option>
                                <option value={USER_TYPE.SUPPLIER}>Supplier</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Account Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700"
                            >
                                <option value={USER_STATUS.ACTIVE}>Active</option>
                                <option value={USER_STATUS.INACTIVE}>Inactive</option>
                            </select>
                        </div>
                    </div>

                    {isEdit && (
                        <div className="space-y-4 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                            <p className="text-[10px] font-black text-primary/50 uppercase tracking-[0.2em] mb-2 px-2">Verification Controls</p>

                            <div className="flex items-center justify-between px-2 py-1">
                                <span className="text-sm font-bold text-gray-700">Email Verified</span>
                                <button
                                    type="button"
                                    onClick={() => handleToggle('isEmailVerified')}
                                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.isEmailVerified ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.isEmailVerified ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between px-2 py-1">
                                <span className="text-sm font-bold text-gray-700">Mobile Verified</span>
                                <button
                                    type="button"
                                    onClick={() => handleToggle('isMobileVerified')}
                                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.isMobileVerified ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.isMobileVerified ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between px-2 py-1">
                                <span className="text-sm font-bold text-gray-700">Profile Verified (IsVerified)</span>
                                <button
                                    type="button"
                                    onClick={() => handleToggle('isVerified')}
                                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.isVerified ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.isVerified ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                        <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                        <CustomButton type="submit" disabled={loading} className="flex-1 rounded-2xl h-14">{loading ? 'Processing...' : isEdit ? 'Save Changes' : 'Create Member'}</CustomButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
