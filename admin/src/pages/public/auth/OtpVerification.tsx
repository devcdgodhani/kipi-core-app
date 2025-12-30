import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useDispatch } from 'react-redux';
import { ShieldCheck, Timer, RefreshCcw, ArrowRight, ShieldAlert } from 'lucide-react';
import { authService } from '../../../api/services/auth.service';
import { setLoginSuccess } from '../../../Redux/slices/authSlice';
import { TokenManager } from '../../../api/middleware/TokenManager';
import { TOKEN_TYPE } from '../../../types';
import { Button } from '../../../components/common/Button';

const OtpVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { userId, email } = location.state || {};

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) navigate('/login');

        const countdown = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(countdown);
    }, [userId, navigate]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerify = async () => {
        const otpValue = otp.join('');
        if (otpValue.length < 6) {
            setError('Incomplete verification sequence');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authService.verifyOtp({ token: userId, otp: otpValue });
            if (response.status === 200 || response.code === 'OK') {
                const { tokens, user } = response.data;
                const accessToken = tokens?.find((t: any) => t.type === TOKEN_TYPE.ACCESS_TOKEN)?.token;
                const refreshToken = tokens?.find((t: any) => t.type === TOKEN_TYPE.REFRESH_TOKEN)?.token;

                if (accessToken && refreshToken) {
                    TokenManager.setAccessToken(accessToken);
                    TokenManager.setRefreshToken(refreshToken);

                    if (user) {
                        dispatch(setLoginSuccess({
                            user: user,
                            token: accessToken,
                            refreshToken: refreshToken
                        }));
                        navigate('/dashboard');
                    } else {
                        navigate('/login', { state: { message: 'Node authorized! Establish connection.' } });
                    }
                } else {
                    navigate('/login', { state: { message: 'Node authorized! Establish connection.' } });
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification mismatch detected');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
            <div className="space-y-2">
                <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-brand-500" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">Node Verification</h2>
                <p className="text-slate-500 text-sm font-medium">Verify credentials sent to <span className="text-slate-300">{email}</span></p>
            </div>

            <div className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        <p className="text-xs font-bold text-red-400 uppercase tracking-tight">{error}</p>
                    </div>
                )}

                <div className="flex justify-between gap-3">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-full h-14 bg-slate-900/50 border border-white/5 rounded-2xl text-center text-xl font-black text-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all"
                            maxLength={1}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-center gap-4 py-2">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                        <Timer className="w-3.5 h-3.5" />
                        <span>Resend in {timer}s</span>
                    </div>
                    {timer === 0 && (
                        <button className="flex items-center gap-2 text-brand-500 hover:text-brand-400 font-black text-[10px] uppercase tracking-widest transition-colors animate-in fade-in">
                            <RefreshCcw className="w-3.5 h-3.5" />
                            Force Resend
                        </button>
                    )}
                </div>

                <Button
                    onClick={handleVerify}
                    className="w-full py-4 text-xs tracking-[0.2em] uppercase"
                    isLoading={loading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                    Authorize Node
                </Button>
            </div>

            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer hover:text-slate-400 transition-colors" onClick={() => navigate('/login')}>
                Cancel Initialization
            </p>
        </div>
    );
};

export default OtpVerification;
