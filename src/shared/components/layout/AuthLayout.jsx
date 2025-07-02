// src/components/layout/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* 필요 없으면 주석 처리하거나 빈 div로 대체 가능 */}
            <Header />
            <main className="flex-grow flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
                    <Outlet /> {/* 로그인/회원가입 페이지 렌더 */}
                </div>
            </main>
            <Footer />
        </div>
    );
}
