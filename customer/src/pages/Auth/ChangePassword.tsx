import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { Lock, Eye } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAppDispatch } from '../../features/hooks';
import { logout } from '../../features/auth/authSlice';

const ChangePassword: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New password and confirm password do not match');
            setLoading(false);
            return;
        }

        try {
            await authService.changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
            });

            setSuccess('Password changed successfully. Please login again.');

            // Logout after successful password change (optional, but secure practice)
            setTimeout(async () => {
                await authService.logout();
                dispatch(logout());
                navigate('/login');
            }, 2000);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-10 bg-gray-50 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-400 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-75"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <div className="flex flex-col items-center mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-primary mb-4 bg-primary/5">
                                <Lock size={24} className="text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm text-center">
                                {success}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="relative">
                                <CustomInput
                                    label="Current Password"
                                    name="oldPassword"
                                    type={showOldPassword ? "text" : "password"}
                                    placeholder="Enter current password"
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-9 text-primary/60 hover:text-primary z-10"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                >
                                    <Eye size={18} />
                                </button>
                            </div>

                            <div className="relative">
                                <CustomInput
                                    label="New Password"
                                    name="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-9 text-primary/60 hover:text-primary z-10"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    <Eye size={18} />
                                </button>
                            </div>

                            <div className="relative">
                                <CustomInput
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-9 text-primary/60 hover:text-primary z-10"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Eye size={18} />
                                </button>
                            </div>

                            <CustomButton fullWidth type="submit" disabled={loading}>
                                {loading ? 'Updating Password...' : 'Update Password'}
                            </CustomButton>

                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
