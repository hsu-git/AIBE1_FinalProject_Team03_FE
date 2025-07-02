import { Eye, EyeOff } from 'lucide-react';

export function EditProfileForm({
    icon: Icon,
    type = 'text',
    name,
    value,
    labelName,
    error,
    onChange,
    disabled,
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
                {labelName}
            </label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    id={name}
                    type={showToggle && showValue ? 'text' : type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full pl-10 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
            {error && (
                <p className="text-red-400 text-xs mt-1 text-left">{error}</p>
            )}
        </div>
    );
}
