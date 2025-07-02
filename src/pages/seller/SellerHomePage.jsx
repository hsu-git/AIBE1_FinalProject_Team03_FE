import React from 'react';
// import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext'; // AuthContext 임포트

const SellerHomePage = () => {
    // const { user } = useContext(AuthContext); // 유저 정보 활용 (현재 사용 X - 추후 확장 예정)

    return (
        // 이 컴포넌트는 SellerLayout의 Outlet에 렌더링될 실제 콘텐츠입니다
        <div className="flex flex-col px-6 py-5 bg-[#111922] text-white">
            <div className="flex flex-wrap justify-between gap-3 p-4">
                <div className="flex min-w-72 flex-col gap-3">
                    <p className="text-white tracking-light text-[32px] font-bold leading-tight">
                        판매자 대시보드
                    </p>
                    <p className="text-[#93acc8] text-sm font-normal leading-normal">
                        환영합니다! 콘서트 및 신청 상태를 관리하세요.
                    </p>
                </div>
            </div>

            {/* 판매자 페이지의 간략한 대시보드 위젯 추가 고려 중 */}
            {/* <div className="bg-[#121a21] p-4 rounded-lg mt-4">
                <h3 className="text-white text-xl font-bold">콘서트 요약</h3>
                <p className="text-gray-400">현재 활성화된 콘서트 수: X개</p>
            </div> */}
        </div>
    );
};

export default SellerHomePage;
