import React, { useState, useEffect } from 'react';
import { adminSellerService } from '../../features/admin/services/adminSellerService'; // adminSellerService 임포트
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner'; // 로딩 스피너 임포트
import ErrorMessage from '../../shared/components/ui/ErrorMessage'; // 에러 메시지 임포트

const AdminDashboard = () => {
    // --- 상태 관리 ---
    const [pendingCount, setPendingCount] = useState(0); // 대기 중인 신청 건수
    const [currentSellersCount, setCurrentSellersCount] = useState(0); // 현재 판매자 수
    const [recentActivities, setRecentActivities] = useState([]); // 최근 활동 목록 (테이블용)
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    // --- 데이터 페칭 (useEffect) ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. 대기 중인 판매자 신청 목록 건수 조회 (API-04-01)
                const pendingApps =
                    await adminSellerService.getPendingSellerApplications();
                setPendingCount(pendingApps.length); // 배열의 길이로 건수 설정

                // 2. 현재 판매자 목록 인원수 조회 (API-04-05)
                const currentSellers =
                    await adminSellerService.getCurrentSellers();
                setCurrentSellersCount(currentSellers.length); // 배열의 길이로 인원수 설정

                // 3. 전체 판매자 이력 목록 조회 (API-04-06) - 최근 5건만 가져와서 대시보드에 표시
                // 페이지 0, 사이즈 5, 최신순으로 정렬 (백엔드 기본 정렬이 created_at,desc 이므로 별도 sort 파라미터는 명시하지 않음)
                const historyResponse =
                    await adminSellerService.getAllSellerApprovalHistory({
                        page: 0,
                        size: 5, // 대시보드에 표시할 최근 활동 개수
                        // keyword: undefined, // 필요시 추가
                        // typeFilter: undefined, // 필요시 추가
                    });
                setRecentActivities(historyResponse.content); // 페이지 응답의 content (리스트)
            } catch (err) {
                console.error('관리자 대시보드 데이터 로드 실패:', err);
                setError(
                    err.response?.data?.message ||
                        '데이터를 불러오는데 실패했습니다.',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // 컴포넌트 마운트 시 한 번만 실행

    // --- 유틸리티 함수: 날짜 포맷팅 ---
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    // --- 유틸리티 함수: 이력 타입 한글명 매핑 ---
    const getHistoryTypeLabel = (type) => {
        const STATUS_LABELS = {
            REQUEST: '신청',
            SUBMITTED: '신청',
            APPROVED: '승인',
            REJECTED: '반려',
            WITHDRAWN: '철회',
            REVOKED: '강제 해제',
        };
        return STATUS_LABELS[type] || type;
    };

    // --- 로딩 및 에러 처리 UI ---
    if (loading) {
        return <LoadingSpinner message="대시보드 데이터를 불러오는 중..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="p-6 bg-[#111922] text-white min-h-[calc(100vh-64px)]">
            {/* Dashboard 제목 섹션 */}
            <div className="p-4 flex flex-row gap-y-3 items-start justify-between flex-wrap content-start self-stretch shrink-0 relative">
                <div className="flex flex-col gap-0 items-start justify-start shrink-0 w-72 min-w-[288px] relative">
                    <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-[32px] leading-10 font-bold relative self-stretch">
                        Dashboard{' '}
                    </div>
                </div>
            </div>

            {/* 요약 카드 섹션 */}
            <div className="p-4 flex flex-row gap-4 items-start justify-start flex-wrap content-start self-stretch shrink-0 relative">
                {/* Pending Seller Applications 카드 */}
                <div className="rounded-lg border-solid border-[#334a66] border p-6 flex flex-col gap-2 items-start justify-start flex-1 min-w-[158px] relative">
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-base leading-6 font-medium relative self-stretch">
                            Pending Seller Applications{' '}
                        </div>
                        {/* 이미지 태그 추가 */}
                        <img
                            src="/admin-vector-03.svg" // 판매자/승인 관련 아이콘
                            alt="Pending Applications Icon"
                            className="w-6 h-6 mt-2"
                        />
                    </div>
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-2xl leading-[30px] font-bold relative self-stretch">
                            {pendingCount} {/* 동적 데이터 */}
                        </div>
                    </div>
                </div>
                {/* Current Sellers 카드 */}
                <div className="rounded-lg border-solid border-[#334a66] border p-6 flex flex-col gap-2 items-start justify-start flex-1 min-w-[158px] relative">
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-base leading-6 font-medium relative self-stretch">
                            Current Sellers{' '}
                        </div>
                        {/* 이미지 태그 추가 */}
                        <img
                            src="/admin-vector-00.svg" // 대시보드/홈 아이콘, 전체 현황 의미
                            alt="Current Sellers Icon"
                            className="w-6 h-6 mt-2"
                        />
                    </div>
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-2xl leading-[30px] font-bold relative self-stretch">
                            {currentSellersCount} {/* 동적 데이터 */}
                        </div>
                    </div>
                </div>
                {/* Recent Activities 카드 */}
                <div className="rounded-lg border-solid border-[#334a66] border p-6 flex flex-col gap-2 items-start justify-start flex-1 min-w-[158px] relative">
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-base leading-6 font-medium relative self-stretch">
                            Recent Activities{' '}
                        </div>
                        {/* 이미지 태그 추가 */}
                        <img
                            src="/admin-vector-01.svg" // 활동/통계 아이콘
                            alt="Recent Activities Icon"
                            className="w-6 h-6 mt-2"
                        />
                    </div>
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-2xl leading-[30px] font-bold relative self-stretch">
                            {recentActivities.length > 0
                                ? recentActivities.length
                                : 0}{' '}
                            {/* 동적 데이터: 가져온 최근 활동 목록의 길이로 표시 */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions 섹션 */}
            <div className="pt-5 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-[22px] leading-7 font-bold relative self-stretch">
                    Quick Actions{' '}
                </div>
            </div>
            <div className="flex flex-row items-start justify-between self-stretch shrink-0 relative">
                <div className="pt-3 pr-4 pb-3 pl-4 flex flex-row gap-3 items-start justify-start flex-wrap content-start flex-1 relative">
                    {/* 버튼들은 다음 작업에서 NavLink로 연결 예정 */}
                    <button className="bg-[#1a78e5] rounded-lg pr-4 pl-4 flex flex-row gap-0 items-center justify-center shrink-0 h-10 min-w-[84px] max-w-[480px] relative overflow-hidden">
                        <div className="flex flex-col gap-0 items-center justify-start shrink-0 relative overflow-hidden">
                            <div
                                className="text-[#ffffff] text-center font-['Inter-Bold',_sans-serif] text-sm leading-[21px] font-bold relative self-stretch overflow-hidden"
                                style={{
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Approve/Reject Sellers{' '}
                            </div>
                        </div>
                    </button>
                    <button className="bg-[#243347] rounded-lg pr-4 pl-4 flex flex-row gap-0 items-center justify-center shrink-0 h-10 min-w-[84px] max-w-[480px] relative overflow-hidden">
                        <div className="flex flex-col gap-0 items-center justify-start shrink-0 relative overflow-hidden">
                            <div
                                className="text-[#ffffff] text-center font-['Inter-Bold',_sans-serif] text-sm leading-[21px] font-bold relative self-stretch overflow-hidden"
                                style={{
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Manage Sellers{' '}
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Recent Activities 테이블 섹션 */}
            <div className="pt-5 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-[22px] leading-7 font-bold relative self-stretch">
                    Recent Activities{' '}
                </div>
            </div>
            <div className="pt-3 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                <div className="bg-[#121a21] rounded-lg border-solid border-[#334a66] border flex flex-row gap-0 items-start justify-start self-stretch shrink-0 relative overflow-hidden">
                    <div className="flex flex-col gap-0 items-start justify-start flex-1 relative">
                        <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                            <div className="bg-[#1a2633] flex flex-row gap-0 items-start justify-start self-stretch flex-1 relative">
                                <div className="pt-3 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 w-[286px] relative">
                                    <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-sm leading-[21px] font-medium relative self-stretch">
                                        User{' '}
                                    </div>
                                </div>
                                <div className="pt-3 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 w-[294px] relative">
                                    <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-sm leading-[21px] font-medium relative self-stretch">
                                        Action{' '}
                                    </div>
                                </div>
                                <div className="pt-3 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 w-[294px] relative">
                                    <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-sm leading-[21px] font-medium relative self-stretch">
                                        Timestamp{' '}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* 실제 데이터 연동 */}
                        <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="border-solid border-[#e5e8eb] border-t flex flex-row gap-0 items-start justify-start self-stretch shrink-0 h-[72px] relative"
                                    >
                                        <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[286px] h-[72px] relative">
                                            <div className="text-[#ffffff] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                                {activity.username} (
                                                {activity.userNickname}){' '}
                                            </div>
                                        </div>
                                        <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[294px] h-[72px] relative">
                                            <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                                {getHistoryTypeLabel(
                                                    activity.type,
                                                )}{' '}
                                            </div>
                                        </div>
                                        <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[294px] h-[72px] relative">
                                            <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                                {formatDate(
                                                    activity.createdAt,
                                                )}{' '}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-400 w-full">
                                    최근 활동 내역이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
