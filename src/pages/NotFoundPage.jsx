// 404 에러 페이지
import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
            <div className="max-w-xl">
                <h1 className="text-7xl font-extrabold text-blue-600 mb-4">
                    404
                </h1>
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                    페이지를 찾을 수 없습니다.
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                    요청하신 페이지가 존재하지 않거나 삭제되었을 수 있습니다.
                </p>
                <Link
                    to="/"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 transform hover:scale-105"
                >
                    홈으로 돌아가기
                </Link>
            </div>
        </div>
    );
}

export default NotFoundPage;
