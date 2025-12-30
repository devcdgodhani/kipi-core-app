import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = ({
    label,
    error,
    leftIcon,
    rightIcon,
    className = '',
    ...props
}: InputProps) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {leftIcon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-brand-500 transition-colors">
                        {leftIcon}
                    </div>
                )}
                <input
                    className={`
            w-full bg-surface border border-border rounded-2xl text-sm text-text-primary
            px-4 py-3 placeholder:text-text-secondary
            focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/30
            transition-all duration-200
            ${leftIcon ? 'pl-11' : ''}
            ${rightIcon ? 'pr-11' : ''}
            ${error ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/50' : ''}
            ${className}
          `}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tight">
                    {error}
                </p>
            )}
        </div>
    );
};

