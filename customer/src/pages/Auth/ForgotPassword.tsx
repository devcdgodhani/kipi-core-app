import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { Mail, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/auth.service';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await authService.sendOtp({
                email,
                type: 'CUSTOMER',
                otpType: 'FORGET_PASSWORD'
            });

            setSuccess(true);
            // Redirect to verify-otp page after a short delay
            setTimeout(() => {
                navigate('/verify-otp', {
                    state: {
                        email,
                        type: 'CUSTOMER',
                        otpType: 'FORGET_PASSWORD',
                        message: 'A verification code has been sent to your email to reset your password.'
                    }
                });
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
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

                    <h1 className="text-4xl font-bold text-primary mb-2">Forgot Password?</h1>
                    <p className="text-sm text-primary/60">Enter your email to receive a password reset code</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg text-center font-medium">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 text-xs text-green-600 bg-green-50 border border-green-100 rounded-lg text-center font-medium">
                            Reset code sent successfully! Redirecting...
                        </div>
                    )}

                    <CustomInput
                        name="email"
                        label="Email Address"
                        placeholder="Enter your registered email"
                        type="email"
                        icon={<Mail size={18} />}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={success}
                    />

                    <CustomButton fullWidth disabled={loading || success}>
                        {loading ? 'Sending Code...' : 'Send Reset Code'}
                    </CustomButton>

                    <div className="text-center pt-2">
                        <Link to="/login" className="inline-flex items-center text-sm font-semibold text-primary/60 hover:text-primary gap-2">
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
