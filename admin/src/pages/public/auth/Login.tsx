import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { authService } from '../../../api/services/auth.service';
import { setLoginSuccess } from '../../../Redux/slices/authSlice';
import { TokenManager } from '../../../api/middleware/TokenManager';
import { TOKEN_TYPE, USER_TYPE } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';

const loginSchema = Yup.object().shape({
    username: Yup.string().required('Identification required'),
    password: Yup.string().min(6, 'Minimum 6 characters').required('Access key required'),
});

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
            type: USER_TYPE.MASTER_ADMIN,
        },
        validationSchema: loginSchema,
        onSubmit: async (values, { setSubmitting, setStatus }) => {
            try {
                const response = await authService.login(values);

                if (response.status === 200 || response.code === 'OK') {
                    const { tokens, ...user } = response.data;

                    const accessToken = tokens.find((t: any) => t.type === TOKEN_TYPE.ACCESS_TOKEN)?.token;
                    const refreshToken = tokens.find((t: any) => t.type === TOKEN_TYPE.REFRESH_TOKEN)?.token;

                    if (accessToken && refreshToken) {
                        TokenManager.setAccessToken(accessToken);
                        TokenManager.setRefreshToken(refreshToken);

                        dispatch(setLoginSuccess({
                            user: user as any,
                            token: accessToken,
                            refreshToken: refreshToken
                        }));

                        navigate('/dashboard');
                    }
                }
            } catch (error: any) {
                setStatus(error.response?.data?.message || 'Authentication override failed');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight">System Access</h2>
                <p className="text-slate-500 text-sm font-medium">Initialize administrative session</p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
                {formik.status && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-shake">
                        <ShieldCheck className="w-5 h-5 text-red-500" />
                        <p className="text-xs font-bold text-red-400 uppercase tracking-tight">{formik.status}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <Input
                        label="Identity (Email/Username)"
                        name="username"
                        type="text"
                        placeholder="admin.nexus@kipicore.io"
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.username ? formik.errors.username : ''}
                        leftIcon={<Mail className="w-4 h-4" />}
                    />

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
                </div>

                <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="w-4 h-4 border border-white/10 rounded bg-white/5 group-hover:border-brand-500/50 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300">Remember Node</span>
                    </label>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-500 hover:text-brand-400 cursor-pointer transition-colors">
                        Lost Access?
                    </span>
                </div>

                <Button
                    type="submit"
                    className="w-full py-4 text-xs tracking-[0.2em] uppercase"
                    isLoading={formik.isSubmitting}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                    Establish Connection
                </Button>
            </form>

            <div className="pt-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    New Administrator?{' '}
                    <span
                        onClick={() => navigate('/signup')}
                        className="text-brand-500 hover:text-brand-400 cursor-pointer transition-colors ml-1"
                    >
                        Request Provisioning
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
