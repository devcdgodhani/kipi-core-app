import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { Shield } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAppDispatch } from '../../features/hooks';
import { setUser } from '../../features/auth/authSlice';

const VerifyOTP: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(60); // 1 minute = 60 seconds
    const [canResend, setCanResend] = useState(false);
    const [resending, setResending] = useState(false);

    const email = location.state?.email || '';
    const message = location.state?.message || 'Please verify your account';

    // Timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.verifyOTP({ otp });

            if (response && response.data) {
                // Store all tokens in localStorage
                if (response.data.tokens && Array.isArray(response.data.tokens)) {
                    response.data.tokens.forEach((tokenObj: any) => {
                        if (tokenObj.type && tokenObj.token) {
                            localStorage.setItem(tokenObj.type, tokenObj.token);
                        }
                    });

                    // Find ACCESS_TOKEN for the main token
                    const accessToken = response.data.tokens.find((t: any) => t.type === 'ACCESS_TOKEN');

                    // Store user and access token in Redux and localStorage
                    if (response.data.user && accessToken) {
                        dispatch(setUser({
                            user: response.data.user,
                            token: accessToken.token,
                        }));
                    }
                }

                // Handle redirection based on OTP type or tokens received
                const forgetPasswordToken = response.data?.tokens?.find((t: any) => t.type === 'FORGET_PASSWORD_TOKEN');

                if (forgetPasswordToken) {
                    navigate('/reset-password');
                } else {
                    // Redirect to home for normal verification/login
                    navigate('/');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend || !email) return;

        setResending(true);
        setError('');

        try {
            await authService.sendOtp({
                email,
                type: 'CUSTOMER',
                otpType: 'ACCOUNT_CREATE',
            });

            // Reset timer
            setResendTimer(60);
            setCanResend(false);
            setError('');
            // Show success message
            alert('OTP has been resent to your email!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md bg-transparent p-8 rounded-3xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-primary mb-4">
                        <Shield size={32} className="text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold text-primary mb-2">Verify OTP</h1>
                    <p className="text-sm text-primary/60">{message}</p>
                    {email && (
                        <p className="text-xs text-primary/40 mt-2">
                            OTP sent to: <span className="font-semibold">{email}</span>
                        </p>
                    )}
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <CustomInput
                        label="Enter OTP"
                        name="otp"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength={6}
                    />

                    <CustomButton fullWidth type="submit" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </CustomButton>

                    <div className="text-center text-sm text-primary/60 pt-2">
                        Didn't receive OTP?{' '}
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={resending}
                                className="font-bold text-primary hover:underline disabled:opacity-50"
                            >
                                {resending ? 'Resending...' : 'Resend'}
                            </button>
                        ) : (
                            <span className="font-bold text-primary/40">
                                Resend in {resendTimer}s
                            </span>
                        )}
                    </div>

                    <div className="text-center text-sm text-primary/60">
                        <Link to="/login" className="font-bold text-primary hover:underline">Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP;
