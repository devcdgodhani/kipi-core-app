import React from 'react';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
    fullWidth?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    ...props
}) => {
    const baseStyles = "px-6 py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90 shadow-lg",
        secondary: "bg-secondary text-white hover:bg-secondary/90",
        accent: "bg-accent text-white hover:bg-accent/90 shadow-lg hover:shadow-accent/25",
        outline: "border-2 border-primary text-primary hover:bg-primary/10",
        ghost: "bg-transparent text-gray-500 hover:bg-gray-100 border-none"
    };

    return (
        <button
            {...props}
            className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${props.className || ''}`}
        >
            {children}
        </button>
    );
};

export default CustomButton;
