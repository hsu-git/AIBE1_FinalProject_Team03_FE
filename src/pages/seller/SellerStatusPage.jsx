import React from 'react';
import { NavLink } from 'react-router-dom'; // NavLink 임포트
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext'; // AuthContext 임포트

const SellerStatusPage = () => {
    // 이름 변경
    const { user } = useContext(AuthContext); // user 정보 가져오기
    // ROLE_SELLER로 역할 판단 로직 수정
    const isSeller =
        user &&
        (user.role === 'ROLE_SELLER' ||
            (user.roles && user.roles.includes('ROLE_SELLER')));

    return (
        // 이 컴포넌트는 SellerLayout의 Outlet에 렌더링될 실제 콘텐츠입니다.
        <div className="flex flex-col px-6 py-5 bg-[#111922] text-white">
            <div className="flex flex-wrap justify-between gap-3 p-4">
                <div className="flex min-w-72 flex-col gap-3">
                    <p className="text-white tracking-light text-[32px] font-bold leading-tight">
                        판매자 권한 상태
                    </p>
                    <p className="text-[#93acc8] text-sm font-normal leading-normal">
                        판매자 권한 신청 및 상태를 확인하세요.
                    </p>
                </div>
            </div>

            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                Current Role
            </h3>
            <div className="bg-[#121a21] pt-2 pr-4 pb-2 pl-4 flex flex-row gap-4 items-center justify-start self-stretch shrink-0 h-[72px] min-h-[72px] relative">
                <div className="bg-[#243347] rounded-lg flex flex-row gap-0 items-center justify-center shrink-0 w-12 h-12 relative">
                    <div className="shrink-0 w-6 h-6 relative overflow-hidden">
                        {/* SVG 아이콘 사용 */}
                        <img
                            className="w-6 h-6 absolute left-0 top-0 overflow-visible"
                            src="/vector-03.svg" // public 폴더의 SVG 아이콘 참조
                            alt="User Icon"
                        />
                        <div className="flex flex-col gap-0 items-start justify-start w-5 h-[19px] absolute left-0 top-0"></div>
                    </div>
                </div>
                <div className="flex flex-col gap-0 items-start justify-center shrink-0 relative">
                    <div className="flex flex-col gap-0 items-start justify-start shrink-0 w-[77px] relative overflow-hidden">
                        <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-base leading-6 font-medium relative self-stretch">
                            {user?.username || 'Guest'}
                        </div>
                    </div>
                    <div className="flex flex-col gap-0 items-start justify-start shrink-0 relative overflow-hidden">
                        <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                            {isSeller ? 'Seller (Approved)' : 'Not a Seller'}
                        </div>
                    </div>
                </div>
            </div>
            <div className="pt-4 pr-4 pb-2 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-lg leading-[23px] font-bold relative self-stretch">
                    Application Status
                </div>
            </div>
            <div className="bg-[#121a21] pt-3 pr-4 pb-3 pl-4 flex flex-row gap-4 items-start justify-start self-stretch shrink-0 relative">
                <div className="bg-[#243347] rounded-lg flex flex-row gap-0 items-center justify-center shrink-0 w-12 h-12 relative">
                    <div className="shrink-0 w-6 h-6 relative overflow-hidden">
                        {/* SVG 아이콘 사용 */}
                        <img
                            className="w-6 h-6 absolute left-0 top-0 overflow-visible"
                            src="/vector-04.svg" // public 폴더의 SVG 아이콘 참조
                            alt="Status Icon"
                        />
                        <div className="flex flex-col gap-0 items-start justify-start w-5 h-5 absolute left-0 top-0"></div>
                    </div>
                </div>
                <div className="flex flex-col gap-0 items-start justify-center flex-1 relative">
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-base leading-6 font-medium relative self-stretch">
                            Seller Application
                        </div>
                    </div>
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                            Application Date: 2025-01-15
                            <br />
                            Last Processed Date: 2025-01-20{' '}
                        </div>
                    </div>
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                            Approved{' '}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row items-start justify-between self-stretch shrink-0 relative">
                <div className="pt-3 pr-4 pb-3 pl-4 flex flex-row gap-3 items-start justify-start flex-wrap content-start flex-1 relative">
                    {isSeller ? (
                        <>
                            <div className="bg-[#243347] rounded-[20px] pr-4 pl-4 flex flex-row gap-0 items-center justify-center shrink-0 h-10 min-w-[84px] max-w-[480px] relative overflow-hidden">
                                <div className="flex flex-col gap-0 items-center justify-start shrink-0 relative overflow-hidden">
                                    <div
                                        className="text-[#ffffff] text-center font-['Inter-Bold',_sans-serif] text-sm leading-[21px] font-bold relative self-stretch overflow-hidden"
                                        style={{
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        Withdraw Application{' '}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#1a78e5] rounded-[20px] pr-4 pl-4 flex flex-row gap-0 items-center justify-center shrink-0 h-10 min-w-[84px] max-w-[480px] relative overflow-hidden">
                                <div className="flex flex-col gap-0 items-center justify-start shrink-0 relative overflow-hidden">
                                    <div
                                        className="text-[#ffffff] text-center font-['Inter-Bold',_sans-serif] text-sm leading-[21px] font-bold relative self-stretch overflow-hidden"
                                        style={{
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        Reapply{' '}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        // 일반 유저는 신청 버튼만 필요 (판매자 권한 신청 페이지로 직접 이동)
                        <NavLink
                            to="/seller/apply"
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#1a78e5] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                        >
                            <span className="truncate">
                                판매자 권한 신청하기
                            </span>
                        </NavLink>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerStatusPage; // 이름 변경
