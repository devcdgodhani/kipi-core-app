import { Outlet } from 'react-router';

const AuthLayout = () => {
    return (
        <div className="min-h-screen relative flex items-center justify-center bg-background overflow-hidden font-sans transition-colors duration-300">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />

            <div className="relative z-10 w-full max-w-[440px] px-6 py-12">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-500/40 mb-4 rotate-3">
                        <span className="text-white text-3xl font-black italic tracking-tighter">K</span>
                    </div>
                    <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase italic">
                        KipiCore<span className="text-brand-500">Nexus</span>
                    </h1>
                    <p className="text-text-secondary text-xs font-bold uppercase tracking-widest mt-2">
                        Administrative Protocol
                    </p>
                </div>

                <div className="bg-surface/50 backdrop-blur-3xl border border-border rounded-[40px] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                    {/* Subtle inner highlight */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />

                    <Outlet />
                </div>

                {/* Footer Links */}
                <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                    <span className="hover:text-text-primary cursor-pointer transition-colors">Security Audit</span>
                    <span className="w-1 h-1 bg-border rounded-full" />
                    <span className="hover:text-text-primary cursor-pointer transition-colors">v2.0.Nexus</span>
                    <span className="w-1 h-1 bg-border rounded-full" />
                    <span className="hover:text-text-primary cursor-pointer transition-colors">Privacy Node</span>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
