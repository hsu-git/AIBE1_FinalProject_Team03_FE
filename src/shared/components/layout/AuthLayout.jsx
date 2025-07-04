// src/components/layout/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-900">
            <Header />
            <main className="flex-grow flex items-center justify-center px-4 py-8">
                <Outlet /> {/* 로그인/회원가입 페이지 */}
            </main>
            <Footer />
        </div>
    );
}
