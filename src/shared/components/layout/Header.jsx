import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext'; // AuthContext 임포트

export default function Header() {
    const { user, logout, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // 왼쪽 영역: 로고 및 메인 네비게이션에 포함될 링크들
    const mainNavigationLinks = [
        { to: '/', label: 'Home' },
        { to: '/concerts', label: 'Concerts' },
    ];

    // 사용자가 로그인되어 있을 때 왼쪽 네비게이션에 추가될 링크 (Admin Dashboard, Profile)
    if (!loading && user) {
        // 관리자 권한을 가진 경우 'Admin Dashboard' 링크 추가
        if (
            user.role === 'ROLE_ADMIN' ||
            (user.roles && user.roles.includes('ROLE_ADMIN'))
        ) {
            // ✨ 관리자 역할도 ROLE_ 접두사 확인
            mainNavigationLinks.push({
                to: '/admin',
                label: 'Admin Dashboard',
            });
        }
        // 로그인한 사용자에게 'Profile' 링크 추가
        mainNavigationLinks.push({ to: '/mypage/profile', label: 'Profile' });
    }

    return (
        <header className="bg-gray-900 border-b border-gray-700 p-4">
            <div className="container mx-auto flex items-center justify-between">
                {/* 왼쪽 영역: 로고 및 메인 네비게이션 (Profile 포함) */}
                <nav className="flex items-center space-x-6">
                    {mainNavigationLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `text-gray-300 hover:text-white ${isActive ? 'underline' : ''}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                {/* 오른쪽 영역: 판매자 페이지, 사용자 정보, 로그아웃 버튼 */}
                <div className="flex items-center space-x-4">
                    {loading ? (
                        <div className="text-gray-400">Loading…</div>
                    ) : user ? (
                        <>
                            {/* 판매자 페이지 링크 (로그인 사용자면 누구나 볼 수 있도록) */}
                            <NavLink
                                to="/seller"
                                className={({ isActive }) =>
                                    `text-gray-300 hover:text-white ${isActive ? 'underline' : ''}`
                                }
                            >
                                판매자 페이지
                            </NavLink>
                            {/* 사용자 정보 */}
                            <span className="text-gray-200">
                                Hello, {user.username}
                            </span>
                            {/* 로그아웃 버튼 */}
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        // 비로그인 상태일 때 로그인/회원가입 링크
                        <>
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    `text-gray-300 hover:text-white ${isActive ? 'underline' : ''}`
                                }
                            >
                                Login
                            </NavLink>
                            <NavLink
                                to="/register"
                                className={({ isActive }) =>
                                    `text-gray-300 hover:text-white ${isActive ? 'underline' : ''}`
                                }
                            >
                                Sign Up
                            </NavLink>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
