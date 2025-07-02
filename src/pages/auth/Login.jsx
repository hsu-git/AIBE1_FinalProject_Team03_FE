import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    loginUser,
    socialLoginUser,
} from '../../features/auth/services/loginService';
import { AuthContext } from '../../context/AuthContext'; // 로그인 상태 사용

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { user, login, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        const userData = await loginUser({ username, password });

        if (userData) {
            login(userData);
            navigate('/');
        } else {
            setErrorMessage(
                '로그인 실패: 아이디 또는 비밀번호를 확인해주세요.',
            );
        }
    };

    const handleSocialLogin = (provider) => {
        socialLoginUser(provider);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md space-y-8">
                    {/* Welcome Title */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white mb-8">
                            다시 오신 것을 환영합니다
                        </h1>
                    </div>

                    {/* 로그인 유저 확인용 */}
                    {user && (
                        <div className="card bg-white">
                            {user.username}님 환영합니다.
                            <button
                                onClick={logout}
                                style={{ marginLeft: '10px' }}
                            >
                                로그아웃
                            </button>
                        </div>
                    )}

                    {/* Login Form */}
                    <div className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                아이디
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="아이디를 입력하세요"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                비밀번호
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호를 입력하세요"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <button
                            onClick={handleLogin}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                            로그인
                        </button>
                    </div>

                    {/* 로그인 실패 메시지 표시 */}
                    {errorMessage && (
                        <div className="text-red-400 text-sm text-center mt-4">
                            {errorMessage}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-gray-900 text-gray-400">
                                또는 다음으로 계속하기
                            </span>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            구글로 계속하기
                        </button>

                        <button
                            onClick={() => handleSocialLogin('kakao')}
                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            <div className="w-5 h-5 mr-3 bg-yellow-400 rounded flex items-center justify-center">
                                <svg
                                    className="w-3 h-3"
                                    viewBox="0 0 24 24"
                                    fill="black"
                                >
                                    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                                </svg>
                            </div>
                            카카오로 계속하기
                        </button>

                        <button
                            onClick={() => handleSocialLogin('naver')}
                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            <div className="w-5 h-5 mr-3 bg-green-500 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                    N
                                </span>
                            </div>
                            네이버로 계속하기
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center">
                        <p className="text-gray-400 text-sm">
                            계정이 없으신가요?{' '}
                            <button
                                onClick={() => navigate('/register')}
                                className="text-blue-400 hover:text-blue-300 underline transition-colors"
                            >
                                회원가입
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
