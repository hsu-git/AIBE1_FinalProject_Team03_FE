import React from 'react';

const SuccessMessage = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-green-800 bg-opacity-20 text-green-400 p-6 rounded-lg shadow-md m-4">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-12 h-12 mb-4 text-green-500"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <h2 className="text-xl font-semibold mb-2">성공!</h2>
            <p className="text-lg text-center">
                {message || '작업이 성공적으로 완료되었습니다.'}
            </p>
        </div>
    );
};

export default SuccessMessage;
