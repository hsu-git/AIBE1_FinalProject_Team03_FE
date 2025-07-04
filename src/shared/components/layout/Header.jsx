import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext'; // AuthContext 임포트
import { Menu, X } from 'lucide-react'; // 햄버거 메뉴 아이콘

export default function Header() {
    const { user, logout, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

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
        if (
            user.role === 'ROLE_ADMIN' ||
            (user.roles && user.roles.includes('ROLE_ADMIN'))
        ) {
            mainNavigationLinks.push({
                to: '/admin',
                label: 'Admin Dashboard',
            });
        }
        mainNavigationLinks.push({ to: '/mypage/profile', label: 'Profile' });
    }

    return (
        <header className="bg-gray-900 border-b border-gray-700 p-4">
            <div className="container mx-auto flex items-center justify-between">
                {/* 왼쪽 영역: 로고 및 메인 네비게이션 (Profile 포함) */}
                <nav className="hidden md:flex items-center space-x-10">
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

                {/* 햄버거 메뉴 (모바일용) */}
                <button
                    className="md:hidden text-gray-300"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* 오른쪽 영역: 판매자 페이지, 사용자 정보, 로그아웃 버튼 */}
                <div className="hidden md:flex items-center space-x-4">
                    {loading ? (
                        <div className="text-gray-400">Loading…</div>
                    ) : user ? (
                        <>
                            <NavLink
                                to="/seller"
                                className={({ isActive }) =>
                                    `text-gray-300 hover:text-white ${isActive ? 'underline' : ''}`
                                }
                            >
                                판매자 페이지
                            </NavLink>
                            <span className="text-gray-200">
                                Hello, {user.username}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white text-center px-2 py-1 rounded"
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    `text-gray-300 hover:text-white ${isActive ? 'underline' : ''}`
                                }
                            >
                                로그인
                            </NavLink>
                            <NavLink
                                to="/register"
                                className={({ isActive }) =>
                                    `text-gray-300 hover:text-white ${isActive ? 'underline' : ''}`
                                }
                            >
                                회원가입
                            </NavLink>
                        </>
                    )}
                </div>
            </div>

            {/* 모바일 드롭다운 메뉴 */}
            {menuOpen && (
                <div className="md:hidden mt-2 px-4 space-y-2">
                    {mainNavigationLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `block text-gray-300 hover:text-white ${isActive ? 'underline' : ''}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                    {loading ? (
                        <div className="text-gray-400">Loading…</div>
                    ) : user ? (
                        <>
                            <NavLink
                                to="/seller"
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `block text-gray-300 hover:text-white ${isActive ? 'underline' : ''}`
                                }
                            >
                                판매자 페이지
                            </NavLink>
                            <div className="text-gray-200">
                                Hello, {user.username}
                            </div>
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    handleLogout();
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white text-center px-2 py-1 rounded"
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/login"
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `block text-gray-300 hover:text-white ${isActive ? 'underline' : ''}`
                                }
                            >
                                로그인
                            </NavLink>
                            <NavLink
                                to="/register"
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `block text-gray-300 hover:text-white ${isActive ? 'underline' : ''}`
                                }
                            >
                                회원가입
                            </NavLink>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}
