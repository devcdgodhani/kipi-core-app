import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Settings,
    Key,
    Shield,
    User,
    LogOut,
    Save,
    RefreshCw
} from 'lucide-react';
import { authService } from '../../../api/services/auth.service';
import { logout } from '../../../Redux/slices/authSlice';
import type { RootState } from '../../../Redux/store';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';

const changePasswordSchema = Yup.object().shape({
    password: Yup.string().required('Current password required'),
    newPassword: Yup.string().min(6, 'Minimum 6 characters').required('New password required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Confirm password required'),
});

const AccountSettings = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [loading, setLoading] = useState(false);

    const passwordFormik = useFormik({
        initialValues: {
            password: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: changePasswordSchema,
        onSubmit: async (values, { setSubmitting, setStatus, resetForm }) => {
            try {
                await authService.changePassword({
                    password: values.password,
                    newPassword: values.newPassword,
                });
                setStatus({ type: 'success', message: 'Password changed successfully' });
                resetForm();
            } catch (error: any) {
                setStatus({
                    type: 'error',
                    message: error.response?.data?.message || 'Failed to change password'
                });
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleLogout = async () => {
        setLoading(true);
        try {
            await authService.logout();
            dispatch(logout());
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
            dispatch(logout());
            window.location.href = '/login';
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshProfile = async () => {
        setLoading(true);
        try {
            await authService.getLoggedInUser();
            // You can update the user in Redux here if needed
        } catch (error) {
            console.error('Failed to refresh profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-brand-500/20 to-purple-500/20 rounded-2xl">
                        <Settings className="w-8 h-8 text-brand-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-text-primary tracking-tight">Account Settings</h1>
                        <p className="text-text-secondary text-sm font-medium mt-1">
                            Manage your account and security settings
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleRefreshProfile}
                        variant="secondary"
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                        isLoading={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        leftIcon={<LogOut className="w-4 h-4" />}
                        isLoading={loading}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Profile Information */}
                <div className="col-span-2 space-y-6">
                    {/* User Info Card */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-brand-500/10 rounded-xl">
                                <User className="w-6 h-6 text-brand-500" />
                            </div>
                            <h2 className="text-xl font-black text-text-primary">Profile Information</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-surface-hover/50 rounded-xl border border-border/50">
                                <p className="text-xs font-black uppercase tracking-widest text-text-secondary mb-1">
                                    Full Name
                                </p>
                                <p className="text-text-primary font-bold">
                                    {user?.firstName} {user?.lastName}
                                </p>
                            </div>
                            <div className="p-4 bg-surface-hover/50 rounded-xl border border-border/50">
                                <p className="text-xs font-black uppercase tracking-widest text-text-secondary mb-1">
                                    Username
                                </p>
                                <p className="text-text-primary font-bold">@{user?.username}</p>
                            </div>
                            <div className="p-4 bg-surface-hover/50 rounded-xl border border-border/50">
                                <p className="text-xs font-black uppercase tracking-widest text-text-secondary mb-1">
                                    Email
                                </p>
                                <p className="text-text-primary font-bold">{user?.email}</p>
                            </div>
                            <div className="p-4 bg-surface-hover/50 rounded-xl border border-border/50">
                                <p className="text-xs font-black uppercase tracking-widest text-text-secondary mb-1">
                                    Mobile
                                </p>
                                <p className="text-text-primary font-bold">
                                    {user?.countryCode} {user?.mobile}
                                </p>
                            </div>
                            <div className="p-4 bg-surface-hover/50 rounded-xl border border-border/50">
                                <p className="text-xs font-black uppercase tracking-widest text-text-secondary mb-1">
                                    User Type
                                </p>
                                <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-lg text-xs font-black uppercase">
                                    {user?.type.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="p-4 bg-surface-hover/50 rounded-xl border border-border/50">
                                <p className="text-xs font-black uppercase tracking-widest text-text-secondary mb-1">
                                    Status
                                </p>
                                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase border ${user?.status === 'ACTIVE'
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>
                                    {user?.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-brand-500/10 rounded-xl">
                                <Key className="w-6 h-6 text-brand-500" />
                            </div>
                            <h2 className="text-xl font-black text-text-primary">Change Password</h2>
                        </div>

                        <form onSubmit={passwordFormik.handleSubmit} className="space-y-4">
                            {passwordFormik.status && (
                                <div className={`p-4 rounded-2xl ${passwordFormik.status.type === 'success'
                                    ? 'bg-green-500/10 border border-green-500/20'
                                    : 'bg-red-500/10 border border-red-500/20'
                                    }`}>
                                    <p className={`text-xs font-bold uppercase tracking-tight ${passwordFormik.status.type === 'success'
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                        }`}>
                                        {passwordFormik.status.message}
                                    </p>
                                </div>
                            )}

                            <Input
                                label="Current Password"
                                name="password"
                                type="password"
                                value={passwordFormik.values.password}
                                onChange={passwordFormik.handleChange}
                                onBlur={passwordFormik.handleBlur}
                                error={passwordFormik.touched.password ? passwordFormik.errors.password : ''}
                            />

                            <Input
                                label="New Password"
                                name="newPassword"
                                type="password"
                                value={passwordFormik.values.newPassword}
                                onChange={passwordFormik.handleChange}
                                onBlur={passwordFormik.handleBlur}
                                error={passwordFormik.touched.newPassword ? passwordFormik.errors.newPassword : ''}
                            />

                            <Input
                                label="Confirm New Password"
                                name="confirmPassword"
                                type="password"
                                value={passwordFormik.values.confirmPassword}
                                onChange={passwordFormik.handleChange}
                                onBlur={passwordFormik.handleBlur}
                                error={passwordFormik.touched.confirmPassword ? passwordFormik.errors.confirmPassword : ''}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                leftIcon={<Save className="w-4 h-4" />}
                                isLoading={passwordFormik.isSubmitting}
                            >
                                Update Password
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Security Info Sidebar */}
                <div className="space-y-6">
                    {/* Verification Status */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-brand-500/10 rounded-xl">
                                <Shield className="w-6 h-6 text-brand-500" />
                            </div>
                            <h2 className="text-xl font-black text-text-primary">Verification</h2>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-surface-hover/50 rounded-xl border border-border/50">
                                <span className="text-sm text-text-secondary">Email Verified</span>
                                {user?.isEmailVerified ? (
                                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-xs font-bold">
                                        Verified
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold">
                                        Not Verified
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface-hover/50 rounded-xl border border-border/50">
                                <span className="text-sm text-text-secondary">Mobile Verified</span>
                                {user?.isMobileVerified ? (
                                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-xs font-bold">
                                        Verified
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold">
                                        Not Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-4">
                            Account Details
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-surface-hover/50 rounded-xl border border-border/50">
                                <p className="text-xs text-text-secondary mb-1">Gender</p>
                                <p className="text-text-primary font-bold">{user?.gender}</p>
                            </div>
                            {user?.createdAt && (
                                <div className="p-3 bg-surface-hover/50 rounded-xl border border-border/50">
                                    <p className="text-xs text-text-secondary mb-1">Member Since</p>
                                    <p className="text-text-primary font-bold">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
