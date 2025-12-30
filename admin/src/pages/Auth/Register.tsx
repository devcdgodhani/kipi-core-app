import React from 'react';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { Mail, Lock, User } from 'lucide-react';

const Register: React.FC = () => {
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

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <CustomInput
                        label="Full Name"
                        placeholder="Enter your full name"
                        icon={<User size={18} />}
                    />
                    <CustomInput
                        label="Email Address"
                        placeholder="Enter your email"
                        icon={<Mail size={18} />}
                    />
                    <CustomInput
                        label="Password"
                        type="password"
                        placeholder="Create a password"
                        icon={<Lock size={18} />}
                    />

                    <CustomButton fullWidth>
                        Sign Up
                    </CustomButton>

                    <div className="text-center text-sm text-primary/60 pt-2">
                        Already have an account? <button type="button" className="font-bold text-primary hover:underline">Sign in</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
