// src/shared/components/layout/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header /> {/* 로그인/회원가입 버튼 포함 */}
            <main className="flex-grow container mx-auto px-4 py-6 bg-white">
                <Outlet /> {/* 콘서트 목록/상세 렌더 */}
            </main>
            <Footer />
        </div>
    );
}
