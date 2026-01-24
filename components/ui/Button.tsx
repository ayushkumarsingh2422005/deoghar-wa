import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    isLoading,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = "relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "text-white bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30",
        secondary: "text-indigo-600 bg-white border-2 border-indigo-50 hover:bg-slate-50 focus:ring-indigo-500",
        danger: "text-white bg-linear-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 focus:ring-red-500 shadow-lg shadow-red-500/30",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : null}
            <span className="relative">{children}</span>
        </button>
    );
}
