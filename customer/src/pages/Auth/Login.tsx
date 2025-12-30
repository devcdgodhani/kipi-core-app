import React from 'react';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { Mail, Lock, Eye } from 'lucide-react';

const Login: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md bg-transparent p-8 rounded-3xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-primary mb-2">
                        <span className="font-bold text-lg">N</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-primary mb-8">NIKEN</div>

                    <h1 className="text-4xl font-bold text-primary mb-2">Welcome Back</h1>
                    <p className="text-sm text-primary/60">Sign in to your account to continue</p>
                    <div className="mt-2 text-[11px] text-primary/60">
                        You can log in using your <span className="font-bold">username, email</span>, or <span className="font-bold">mobile number</span>.
                    </div>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <CustomInput
                        label="Email Address / Username / Mobile"
                        placeholder="Enter your username, email, or mobile num"
                        icon={<Mail size={18} />}
                    />

                    <div className="relative">
                        <CustomInput
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            icon={<Lock size={18} />}
                        />
                        <button type="button" className="absolute right-3 top-9 text-primary/60">
                            <Eye size={18} />
                        </button>
                    </div>

                    <CustomButton fullWidth>
                        Sign In
                    </CustomButton>

                    <div className="text-center space-y-4 pt-2">
                        <button type="button" className="text-sm font-semibold text-primary/60 hover:text-primary">
                            Forgot your password?
                        </button>
                        <div className="text-sm text-primary/60">
                            Don't have an account? <button type="button" className="font-bold text-primary hover:underline">Sign up</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
