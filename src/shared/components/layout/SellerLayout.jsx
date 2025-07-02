import React from 'react';
import { Outlet } from 'react-router-dom';
import SellerSidebar from '../../../features/seller/components/SellerSidebar'; // SellerSidebar 컴포넌트 임포트

const SellerLayout = () => {
    return (
        <div className="flex size-full min-h-screen bg-[#111922] text-white">
            {/* 판매자 사이드바 컴포넌트 */}
            <SellerSidebar />

            {/* 메인 콘텐츠 영역 (이곳에 하위 라우트 페이지들이 렌더링됩니다) */}
            <div className="flex-1 flex flex-col">
                {/* 이 Outlet을 통해 하위 라우트의 컴포넌트들이 렌더링됩니다 */}
                <Outlet />
            </div>
        </div>
    );
};

export default SellerLayout;
