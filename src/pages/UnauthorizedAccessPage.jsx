// src/pages/UnauthorizedAccessPage.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UnauthorizedAccessPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // 사용자 권한 확인
    const isAdmin =
        user &&
        (user.role === 'ROLE_ADMIN' ||
            (user.roles && user.roles.includes('ROLE_ADMIN')));
    const isSeller =
        user &&
        (user.role === 'ROLE_SELLER' ||
            (user.roles && user.roles.includes('ROLE_SELLER')));
    // const isNormalUser = user && user.role === 'ROLE_USER';
    const isLoggedIn = !!user; // 로그인 여부

    // 각 버튼 클릭 시 이동할 경로 정의
    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoAdminDashboard = () => {
        navigate('/admin');
    };

    const handleGoSellerPage = () => {
        navigate('/seller');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0D11] text-white p-4">
            <h1 className="text-4xl font-bold mb-4">
                권한이 없는 페이지 입니다. 🚫
            </h1>
            <p className="text-lg text-gray-400 mb-8 text-center">
                요청하신 페이지에 접근할 권한이 없습니다.
            </p>

            <div className="flex flex-col gap-4">
                {/* 모든 유저를 위한 홈 버튼 */}
                <button
                    onClick={handleGoHome}
                    className="px-6 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg shadow-md transition duration-300"
                >
                    🏠 홈으로
                </button>

                {/* 관리자를 위한 관리자 페이지 버튼 */}
                {isLoggedIn && isAdmin && (
                    <button
                        onClick={handleGoAdminDashboard}
                        className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg shadow-md transition duration-300"
                    >
                        ⚙️ 관리자 페이지로
                    </button>
                )}

                {/* 판매자를 위한 판매자 페이지 버튼 */}
                {isLoggedIn && isSeller && (
                    <button
                        onClick={handleGoSellerPage}
                        className="px-6 py-3 bg-[#EC4899] hover:bg-[#DB2777] text-white rounded-lg shadow-md transition duration-300"
                    >
                        💰 판매자 페이지로
                    </button>
                )}
            </div>
        </div>
    );
};

export default UnauthorizedAccessPage;
