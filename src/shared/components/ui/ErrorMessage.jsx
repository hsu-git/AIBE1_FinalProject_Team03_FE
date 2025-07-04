import React from 'react';

const ErrorMessage = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-800 bg-opacity-20 text-red-400 p-6 rounded-lg shadow-md m-4">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-12 h-12 mb-4 text-red-500"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.38 3.375 2.004 3.375h14.71c1.624 0 2.87-1.875 2.003-3.375l-7.152-12.498a1.5 1.5 0 0 0-1.342-.866h-1.611z"
                />
            </svg>
            <h2 className="text-xl font-semibold mb-2">오류 발생!</h2>
            <p className="text-lg text-center">
                {message || '알 수 없는 오류가 발생했습니다.'}
            </p>
            <button
                onClick={() => window.location.reload()}
                className="mt-6 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-300"
            >
                다시 시도
            </button>
        </div>
    );
};

export default ErrorMessage;
