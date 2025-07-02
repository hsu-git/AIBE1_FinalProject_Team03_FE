import React from 'react';
import { Outlet } from 'react-router-dom';
import Breadcrumb from '../ui/Breadcrumb';
import Footer from './Footer';
import Header from './Header';

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-6">
                <Breadcrumb />
                <Outlet /> {/* 각 보호된 페이지 렌더 */}
            </main>
            <Footer />
        </div>
    );
}
