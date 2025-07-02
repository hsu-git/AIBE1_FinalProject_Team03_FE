import { Eye, EyeOff } from 'lucide-react';

export function SignupInput({
    icon: Icon,
    type = 'text',
    name,
    value,
    placeholder,
    placeholderFull,
    error,
    onChange,
    helperText,
    showToggle = false,
    showValue = false,
    onToggle,
}) {
    return (
        <div>
            <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-300 mb-2 text-left"
            >
                {placeholder} *
            </label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    id={name}
                    type={showToggle && showValue ? 'text' : type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={
                        placeholderFull || `${placeholder}를 입력하세요`
                    }
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left ${
                        error ? 'border-red-500' : 'border-gray-700'
                    }`}
                />
                {showToggle && (
                    <button
                        type="button"
                        onClick={onToggle}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                        {showValue ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>
            {helperText && (
                <p className="text-gray-500 text-xs mt-1 text-left">
                    {helperText}
                </p>
            )}
            {error && (
                <p className="text-red-400 text-xs mt-1 text-left">{error}</p>
            )}
        </div>
    );
}
