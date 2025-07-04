import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    loginUser,
    socialLoginUser,
} from '../../features/auth/services/loginService';
import { AuthContext } from '../../context/AuthContext';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!username || !password) {
            setErrorMessage('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        setIsLoading(true);
        const userData = await loginUser({ username, password });
        setIsLoading(false);

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
        <div className="w-full max-w-md sm:max-w-lg bg-gray-800 p-8 sm:p-10 rounded-lg shadow-2xl space-y-8 transition-all">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white">
                    다시 오신 것을 환영합니다
                </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                {/* 아이디 입력 */}
                <div className="relative">
                    <label htmlFor="username" className="sr-only">
                        아이디
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="아이디를 입력하세요"
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>

                {/* 비밀번호 입력 */}
                <div className="relative">
                    <label htmlFor="password" className="sr-only">
                        비밀번호
                    </label>
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* 로그인 버튼 */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full ${
                        isLoading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    {isLoading ? '로그인 중...' : '로그인'}
                </button>

                {/* 에러 메시지 */}
                {errorMessage && (
                    <div className="text-red-400 text-sm text-center transition-opacity duration-300 ease-in-out">
                        {errorMessage}
                    </div>
                )}
            </form>

            {/* 구분선 */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-800 text-gray-300">
                        또는 다음으로 계속하기
                    </span>
                </div>
            </div>

            {/* 소셜 로그인 */}
            <div className="space-y-3">
                {/* Google */}
                <button
                    onClick={() => handleSocialLogin('google')}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-white text-black hover:bg-gray-100 transition"
                >
                    <div className="w-5 h-5 mr-3 flex items-center justify-center">
                        <svg
                            className="w-full h-full"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    </div>
                    구글로 계속하기
                </button>

                {/* Kakao */}
                <button
                    onClick={() => handleSocialLogin('kakao')}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-[#FEE500] text-black hover:bg-yellow-300 transition"
                >
                    <div className="w-5 h-5 mr-3 flex items-center justify-center">
                        <svg
                            className="w-full h-full"
                            viewBox="0 0 24 24"
                            fill="black"
                        >
                            <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                        </svg>
                    </div>
                    카카오로 계속하기
                </button>

                {/* Naver */}
                <button
                    onClick={() => handleSocialLogin('naver')}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-[#03C75A] text-white hover:bg-green-600 transition"
                >
                    <div className="w-5 h-5 mr-3 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">N</span>
                    </div>
                    네이버로 계속하기
                </button>
            </div>

            {/* 회원가입 링크 */}
            <div className="text-center pt-4">
                <p className="text-gray-400 text-sm">
                    계정이 없으신가요?{' '}
                    <button
                        onClick={() => navigate('/register')}
                        className="ml-2 bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition"
                    >
                        회원가입
                    </button>
                </p>
            </div>
        </div>
    );
}
