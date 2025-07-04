import React from 'react';

const LoadingSpinner = ({
    size = 10,
    color = 'text-blue-500',
    message = '로딩 중...',
}) => {
    // const spinnerSizeClass = `w-${size} h-${size}`;
    const sizeMap = {
        4: 'w-4 h-4',
        6: 'w-6 h-6',
        8: 'w-8 h-8',
        10: 'w-10 h-10',
        12: 'w-12 h-12',
    };
    const spinnerSizeClass = sizeMap[size] || 'w-10 h-10';

    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-[#111922] text-white p-4">
            <div
                className={`animate-spin rounded-full border-t-2 border-b-2 ${spinnerSizeClass}`}
                style={{
                    borderTopColor: color.startsWith('#') ? color : '#3B82F6',
                    borderBottomColor: color.startsWith('#')
                        ? color
                        : '#3B82F6',
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                }}
            ></div>
            <p className="mt-4 text-lg text-gray-400">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
