import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { Mail, Lock, User, Phone, Eye } from 'lucide-react';
import { authService } from '../../services/auth.service';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        mobile: '',
        countryCode: '+91',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                mobile: formData.mobile || undefined,
                countryCode: formData.mobile ? formData.countryCode : undefined,
                type: 'CUSTOMER', // Customer type for customer app
            });

            // Response is already unwrapped by axios interceptor
            // So response.status is the API status (201), not HTTP status
            if (response && response.status === 201) {
                // Redirect to OTP verification page
                navigate('/verify-otp', {
                    state: {
                        email: formData.email,
                        message: response.message
                    }
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                    <h1 className="text-4xl font-bold text-primary mb-2">Create Account</h1>
                    <p className="text-sm text-primary/60">Join us for exclusive access</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <CustomInput
                        label="First Name"
                        name="firstName"
                        placeholder="Enter your first name"
                        icon={<User size={18} />}
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                    <CustomInput
                        label="Last Name"
                        name="lastName"
                        placeholder="Enter your last name"
                        icon={<User size={18} />}
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                    <CustomInput
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        icon={<Mail size={18} />}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <CustomInput
                        label="Mobile Number (Optional)"
                        name="mobile"
                        type="tel"
                        placeholder="Enter your mobile number"
                        icon={<Phone size={18} />}
                        value={formData.mobile}
                        onChange={handleChange}
                    />
                    <div className="relative">
                        <CustomInput
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            icon={<Lock size={18} />}
                            value={formData.password}
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

                    <CustomButton fullWidth type="submit" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </CustomButton>

                    <div className="text-center text-sm text-primary/60 pt-2">
                        Already have an account? <Link to="/login" className="font-bold text-primary hover:underline">Sign in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
