import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main>
                <Outlet /> {/* 각 보호된 페이지 렌더 */}
            </main>
            <Footer />
        </div>
    );
}
