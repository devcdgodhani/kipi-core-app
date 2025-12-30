import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { Mail, Lock, Eye } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAppDispatch } from '../../features/hooks';
import { setUser } from '../../features/auth/authSlice';

const Login: React.FC = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await authService.login(credentials);
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

                // Redirect to dashboard
                window.location.href = '/';
            }
        } catch (err: any) {
            if (err.response?.data?.code === 'PENDING_ACCOUNT_VERIFICATION') {
                try {
                    await authService.sendOtp({
                        email: credentials.email,
                        type: 'ADMIN',
                        otpType: 'ACCOUNT_CREATE'
                    });
                    navigate('/verify-otp', {
                        state: {
                            email: credentials.email,
                            type: 'ADMIN',
                            otpType: 'ACCOUNT_CREATE'
                        }
                    });
                    return;
                } catch (otpErr) {
                    console.error('Failed to send OTP', otpErr);
                }
            }
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
                    <div className="text-[10px] uppercase tracking-widest font-bold text-primary mb-8">NIKEN ADMIN</div>

                    <h1 className="text-4xl font-bold text-primary mb-2">Welcome Back</h1>
                    <p className="text-sm text-primary/60">Sign in to your account to continue</p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg text-center font-medium">
                            {error}
                        </div>
                    )}

                    <CustomInput
                        name="email"
                        label="Email Address / Username"
                        placeholder="Enter your email"
                        icon={<Mail size={18} />}
                        value={credentials.email}
                        onChange={handleChange}
                        required
                    />

                    <div className="relative">
                        <CustomInput
                            name="password"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            icon={<Lock size={18} />}
                            value={credentials.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-9 text-primary/60 hover:text-primary z-10"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <Eye size={18} />
                        </button>
                    </div>

                    <CustomButton fullWidth disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </CustomButton>

                    <div className="text-center space-y-4 pt-2">
                        <Link to="/forgot-password" className="text-sm font-semibold text-primary/60 hover:text-primary">
                            Forgot your password?
                        </Link>
                    </div>

                    <div className="text-center text-sm text-primary/60 pt-2 border-t border-primary/10 mt-6">
                        Don't have an account? <Link to="/register" className="font-bold text-primary hover:underline">Sign Up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
