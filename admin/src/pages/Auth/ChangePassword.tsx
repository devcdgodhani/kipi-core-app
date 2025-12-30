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
            });

            setSuccess('Password changed successfully. Please login again.');

            // Logout after successful password change
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
        <div className="p-6">
            <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
                    <p className="text-gray-500 text-sm mt-1">Ensure your account is using a strong password</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm text-center">
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

                    <div className="flex gap-4 pt-2">
                        <CustomButton variant="outline" type="button" onClick={() => navigate(-1)} className="flex-1">
                            Cancel
                        </CustomButton>
                        <CustomButton type="submit" disabled={loading} className="flex-1">
                            {loading ? 'Updating...' : 'Update Password'}
                        </CustomButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
