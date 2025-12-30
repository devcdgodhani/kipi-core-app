import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/auth.service';

const ResetPassword: React.FC = () => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await authService.resetPassword({
                newPassword: formData.newPassword
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md bg-transparent p-8 rounded-3xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-primary mb-2">
                        <span className="font-bold text-lg">N</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-primary mb-8">NIKEN</div>

                    <h1 className="text-4xl font-bold text-primary mb-2">Set New Password</h1>
                    <p className="text-sm text-primary/60">Create a new secure password for your account</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg text-center font-medium">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 text-xs text-green-600 bg-green-50 border border-green-100 rounded-lg text-center font-medium">
                            Password reset successfully! Redirecting to login...
                        </div>
                    )}

                    <div className="relative">
                        <CustomInput
                            name="newPassword"
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            icon={<Lock size={18} />}
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-9 text-primary/60 hover:text-primary z-10"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <CustomInput
                        name="confirmPassword"
                        label="Confirm New Password"
                        type="password"
                        placeholder="Confirm your new password"
                        icon={<Lock size={18} />}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <CustomButton fullWidth disabled={loading || success}>
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </CustomButton>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
