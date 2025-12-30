import { useNavigate } from 'react-router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { User, Mail, Lock, Phone, Globe, UserCheck, ArrowRight, ShieldAlert } from 'lucide-react';
import { authService } from '../../../api/services/auth.service';
import { USER_TYPE, GENDER } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';

const signupSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().email('Invalid email protocol').required('Email required'),
    mobile: Yup.string().required('Mobile frequency required'),
    password: Yup.string().min(6, 'Security depth insufficient').required('Access key required'),
    countryCode: Yup.string().required('Node region required'),
});

const Signup = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            mobile: '',
            password: '',
            countryCode: '+1',
            type: USER_TYPE.ADMIN,
            gender: GENDER.NONE,
        },
        validationSchema: signupSchema,
        onSubmit: async (values, { setSubmitting, setStatus }) => {
            try {
                const response = await authService.register(values);
                if (response.status === 201 || response.code === 'CREATED') {
                    const { tokens } = response.data;
                    const userId = tokens[0].userId;
                    navigate('/verify-otp', { state: { userId, email: values.email } });
                }
            } catch (error: any) {
                setStatus(error.response?.data?.message || 'Provisioning override failed');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight">Access Request</h2>
                <p className="text-slate-500 text-sm font-medium">Provision new administrative node</p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
                {formik.status && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        <p className="text-xs font-bold text-red-400 uppercase tracking-tight">{formik.status}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="First Name"
                        name="firstName"
                        placeholder="John"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.firstName ? formik.errors.firstName : ''}
                        leftIcon={<User className="w-4 h-4" />}
                    />
                    <Input
                        label="Last Name"
                        name="lastName"
                        placeholder="Doe"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.lastName ? formik.errors.lastName : ''}
                        leftIcon={<UserCheck className="w-4 h-4" />}
                    />
                </div>

                <Input
                    label="Email Protocol"
                    name="email"
                    type="email"
                    placeholder="nexus@kipicore.io"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email ? formik.errors.email : ''}
                    leftIcon={<Mail className="w-4 h-4" />}
                />

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                        <Input
                            label="Region"
                            name="countryCode"
                            placeholder="+1"
                            value={formik.values.countryCode}
                            onChange={formik.handleChange}
                            leftIcon={<Globe className="w-4 h-4" />}
                        />
                    </div>
                    <div className="col-span-8">
                        <Input
                            label="Frequency (Mobile)"
                            name="mobile"
                            placeholder="1234567890"
                            value={formik.values.mobile}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.mobile ? formik.errors.mobile : ''}
                            leftIcon={<Phone className="w-4 h-4" />}
                        />
                    </div>
                </div>

                <Input
                    label="Access Key"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password ? formik.errors.password : ''}
                    leftIcon={<Lock className="w-4 h-4" />}
                />

                <Button
                    type="submit"
                    className="w-full py-4 text-xs tracking-[0.2em] uppercase"
                    isLoading={formik.isSubmitting}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                    Request Provisioning
                </Button>
            </form>

            <div className="pt-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    Existing Administrator?{' '}
                    <span
                        onClick={() => navigate('/login')}
                        className="text-brand-500 hover:text-brand-400 cursor-pointer transition-colors ml-1"
                    >
                        Establish Connection
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Signup;
