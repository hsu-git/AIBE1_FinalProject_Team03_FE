import React from 'react';

const Button = ({
    children,
    onClick,
    className = '',
    type = 'button',
    disabled = false,
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`px-6 py-3 rounded-lg text-white font-bold transition-colors duration-300
                  ${disabled ? 'bg-gray-600 cursor-not-allowed opacity-70' : 'bg-[#6366F1] hover:bg-[#4F46E5]'}
                  ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
