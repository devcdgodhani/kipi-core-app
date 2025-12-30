import React from 'react';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
}

const CustomInput: React.FC<CustomInputProps> = ({ label, icon, ...props }) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && <label className="text-sm font-semibold text-primary/80">{label}</label>}
            <div className="relative flex items-center">
                {icon && <div className="absolute left-3 text-primary/60">{icon}</div>}
                <input
                    {...props}
                    className={`w-full border border-primary/20 bg-primary/5 rounded-lg py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${icon ? 'pl-10' : 'pl-4'} pr-4 ${props.className || ''}`}
                />
            </div>
        </div>
    );
};

export default CustomInput;
