import React from 'react';

const InputField = ({
    label,
    name,
    value,
    onChange,
    type = 'text',
    placeholder = '',
    error,
    required = false,
    className = '',
}) => {
    return (
        <div className={`flex flex-col mb-4 ${className}`}>
            <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-300 mb-2"
            >
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full p-3 bg-[#0A0D11] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2
                    ${error ? 'border-red-500 focus:ring-red-500' : 'border-[#243447] focus:ring-[#6366F1]'}`}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default InputField;
