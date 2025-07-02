// 404 에러 페이지
import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center bg-gray-50 p-6 rounded-lg shadow-md">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">
                페이지를 찾을 수 없습니다.
            </h2>
            <p className="text-lg text-gray-600 mb-8">
                요청하신 페이지를 찾을 수 없거나 삭제되었을 수 있습니다.
            </p>
            <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105"
            >
                홈으로 돌아가기
            </Link>
        </div>
    );
}

export default NotFoundPage;
