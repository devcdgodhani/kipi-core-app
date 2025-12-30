import { X } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { userService } from '../../../api/services/user.service';
import type { IUser, USER_TYPE, GENDER, USER_STATUS } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: IUser | null;
}

const editUserSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().email('Invalid email').required('Email required'),
    mobile: Yup.string().required('Mobile required'),
    countryCode: Yup.string().required('Country code required'),
    type: Yup.string().required('User type required'),
    gender: Yup.string().required('Gender required'),
    status: Yup.string().required('Status required'),
});

const EditUserModal = ({ isOpen, onClose, onSuccess, user }: EditUserModalProps) => {
    const formik = useFormik({
        initialValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            mobile: user?.mobile || '',
            countryCode: user?.countryCode || '+1',
            type: (user?.type || 'CUSTOMER') as USER_TYPE,
            gender: (user?.gender || 'NONE') as GENDER,
            status: (user?.status || 'ACTIVE') as USER_STATUS,
        },
        enableReinitialize: true,
        validationSchema: editUserSchema,
        onSubmit: async (values, { setSubmitting, setStatus }) => {
            if (!user) return;

            try {
                await userService.updateOneByFilter({
                    filter: { _id: user._id },
                    update: values
                });
                setStatus({ type: 'success', message: 'User updated successfully' });
                onSuccess();
                setTimeout(() => {
                    onClose();
                }, 1500);
            } catch (error: any) {
                setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to update user' });
            } finally {
                setSubmitting(false);
            }
        },
    });

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface border border-border rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-text-primary">Edit User</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    {formik.status && (
                        <div className={`p-4 rounded-2xl ${formik.status.type === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                            <p className={`text-xs font-bold uppercase tracking-tight ${formik.status.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                {formik.status.message}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            name="firstName"
                            value={formik.values.firstName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.firstName ? formik.errors.firstName : ''}
                        />
                        <Input
                            label="Last Name"
                            name="lastName"
                            value={formik.values.lastName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.lastName ? formik.errors.lastName : ''}
                        />
                    </div>

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email ? formik.errors.email : ''}
                    />

                    <div className="grid grid-cols-4 gap-4">
                        <Input
                            label="Country Code"
                            name="countryCode"
                            value={formik.values.countryCode}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.countryCode ? formik.errors.countryCode : ''}
                        />
                        <div className="col-span-3">
                            <Input
                                label="Mobile"
                                name="mobile"
                                value={formik.values.mobile}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.mobile ? formik.errors.mobile : ''}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-2">
                                User Type
                            </label>
                            <select
                                name="type"
                                value={formik.values.type}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40"
                            >
                                <option value="CUSTOMER">Customer</option>
                                <option value="SUPPLIER">Supplier</option>
                                <option value="ADMIN">Admin</option>
                                <option value="MASTER_ADMIN">Master Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-2">
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={formik.values.gender}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40"
                            >
                                <option value="NONE">Prefer not to say</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                                <option value="DO_NOT_TELL">Do not tell</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formik.values.status}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="secondary"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            isLoading={formik.isSubmitting}
                        >
                            Update User
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
