// src/pages/admin/AdminSellerManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { adminSellerService } from '../../features/admin/services/adminSellerService'; // 새로 만든 서비스 import
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';
import Button from '../../shared/components/ui/Button';
import Modal from '../../shared/components/ui/Modal'; // 모달 컴포넌트
import InputField from '../../shared/components/ui/InputField'; // 입력 필드

// 판매자 승인 이력 타입 (백엔드 SellerApprovalHistory.ActionType과 일치)
const SELLER_HISTORY_TYPES = [
    'ALL', // 전체 (프론트엔드에서 추가)
    'SUBMITTED', // 신청됨
    'REQUEST', // (기존 명칭으로, SUBMITTED와 동일)
    'APPROVED', // 승인됨
    'REJECTED', // 반려됨
    'WITHDRAWN', // 자발적 철회됨
    'REVOKED', // 강제 해제됨
];

// 상태 한글명 매핑
const STATUS_LABELS = {
    ALL: '전체',
    SUBMITTED: '신청됨',
    REQUEST: '신청됨', // REQUEST도 신청됨으로 표시
    PENDING: '처리 대기', // 백엔드 DTO에 PENDING이 있지만, 주로 SUBMITTED를 사용
    APPROVED: '승인됨',
    REJECTED: '반려됨',
    WITHDRAWN: '자발적 철회',
    REVOKED: '강제 해제',
};

const AdminSellerManagement = () => {
    // --- 상태 관리 ---
    const [pendingApplications, setPendingApplications] = useState([]); // 대기 중인 신청 목록 (API-04-01)
    const [allHistory, setAllHistory] = useState([]); // 전체 이력 목록 (API-04-06)
    const [currentSellers, setCurrentSellers] = useState([]); // 현재 판매자 목록 (API-04-05)

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 페이징 및 필터링 상태 (전체 이력 조회용)
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL'); // 기본값 'ALL'

    // 모달 관련 상태
    const [showProcessModal, setShowProcessModal] = useState(false); // 승인/반려 모달
    const [showRevokeModal, setShowRevokeModal] = useState(false); // 강제 해제 모달
    const [showHistoryModal, setShowHistoryModal] = useState(false); // 특정 유저 이력 모달
    const [selectedUser, setSelectedUser] = useState(null); // 모달에 표시할 유저 정보
    const [processReason, setProcessReason] = useState(''); // 반려 사유
    const [revokeReason, setRevokeReason] = useState(''); // 강제 해제 사유
    const [userHistory, setUserHistory] = useState([]); // 특정 유저의 이력

    // --- 데이터 페칭 함수 ---

    // 대기 중인 판매자 신청 목록 조회 (API-04-01)
    const fetchPendingApplications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data =
                await adminSellerService.getPendingSellerApplications();
            setPendingApplications(data);
        } catch (err) {
            setError(
                err.message || '대기 중인 판매자 신청을 불러오지 못했습니다.',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // 전체 판매자 이력 목록 조회 (API-04-06)
    const fetchAllSellerHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                // typeFilter가 'ALL'이 아니면 백엔드로 전달
                typeFilter: typeFilter === 'ALL' ? undefined : typeFilter,
                keyword: searchKeyword || undefined, // 키워드가 없으면 전달 안 함
                sort: 'createdAt,desc', // 항상 최신순 정렬 (필요시 백엔드 PageableDefault에 추가)
            };
            const response =
                await adminSellerService.getAllSellerApprovalHistory(params);
            setAllHistory(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
            setCurrentPage(response.number);
            setPageSize(response.size);
        } catch (err) {
            setError(
                err.message || '전체 판매자 이력 목록을 불러오지 못했습니다.',
            );
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchKeyword, typeFilter]);

    // 현재 판매자 목록 조회 (API-04-05) - 필요시 별도 탭이나 섹션에 구현
    const fetchCurrentSellers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminSellerService.getCurrentSellers();
            setCurrentSellers(data);
        } catch (err) {
            setError(err.message || '현재 판매자 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    // --- 초기 로드 효과 ---
    useEffect(() => {
        fetchPendingApplications(); // 대기 중인 신청 목록
        fetchAllSellerHistory(); // 전체 이력 (검색/필터 포함)
        fetchCurrentSellers(); // 현재 판매자 목록
    }, [fetchPendingApplications, fetchAllSellerHistory, fetchCurrentSellers]);

    // --- 이벤트 핸들러: 승인/반려 ---

    const handleProcessClick = (user, approve) => {
        setSelectedUser({ ...user, approveAction: approve }); // 유저 정보와 어떤 액션인지 저장
        setShowProcessModal(true);
        setProcessReason(''); // 모달 열 때마다 사유 초기화
        setFormErrors({});
    };

    const confirmProcessApplication = async () => {
        if (selectedUser.approveAction === false && !processReason.trim()) {
            setFormErrors({ reason: '반려 시 사유는 필수입니다.' });
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await adminSellerService.processSellerApplication(
                selectedUser.userId,
                selectedUser.approveAction,
                processReason,
            );
            alert(`${selectedUser.approveAction ? '승인' : '반려'} 처리 완료!`);
            setShowProcessModal(false);
            fetchPendingApplications(); // 대기 목록 새로고침
            fetchAllSellerHistory(); // 이력 목록 새로고침
            fetchCurrentSellers(); // 판매자 목록 새로고침 (역할 변경 반영)
        } catch (err) {
            setError(
                err.message ||
                    `판매자 신청 ${selectedUser.approveAction ? '승인' : '반려'} 실패.`,
            );
        } finally {
            setLoading(false);
        }
    };

    // --- 이벤트 핸들러: 강제 권한 해제 ---

    const handleRevokeClick = (user) => {
        setSelectedUser(user);
        setShowRevokeModal(true);
        setRevokeReason(''); // 모달 열 때마다 사유 초기화
        setFormErrors({});
    };

    const confirmRevokeRole = async () => {
        if (!revokeReason.trim()) {
            setFormErrors({ reason: '강제 권한 해제 사유는 필수입니다.' });
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await adminSellerService.revokeSellerRole(
                selectedUser.userId,
                revokeReason,
            );
            alert('판매자 권한 강제 해제 완료!');
            setShowRevokeModal(false);
            fetchPendingApplications(); // 대기 목록 새로고침
            fetchAllSellerHistory(); // 이력 목록 새로고침
            fetchCurrentSellers(); // 판매자 목록 새로고침 (역할 변경 반영)
        } catch (err) {
            setError(err.message || '판매자 권한 강제 해제 실패.');
        } finally {
            setLoading(false);
        }
    };

    // --- 이벤트 핸들러: 특정 유저 이력 상세 조회 ---

    const handleViewUserHistory = async (user) => {
        setSelectedUser(user);
        setLoading(true);
        setError(null);
        try {
            const history =
                await adminSellerService.getSellerApprovalHistoryForUser(
                    user.userId,
                );
            setUserHistory(history);
            setShowHistoryModal(true);
        } catch (err) {
            setError(err.message || '유저 이력을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // --- 페이징 및 검색/필터 핸들러 (전체 이력 조회용) ---

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(0); // 페이지 크기 변경 시 첫 페이지로 이동
    };

    const handleKeywordChange = (e) => {
        setSearchKeyword(e.target.value);
        setCurrentPage(0); // 검색 시 첫 페이지로 이동
    };

    const handleTypeFilterChange = (e) => {
        setTypeFilter(e.target.value);
        setCurrentPage(0); // 필터 시 첫 페이지로 이동
    };

    // useEffect를 사용하여 페이징/검색/필터 조건 변경 시 데이터 다시 불러오기
    useEffect(() => {
        fetchAllSellerHistory();
    }, [
        currentPage,
        pageSize,
        searchKeyword,
        typeFilter,
        fetchAllSellerHistory,
    ]);

    // --- 로딩 및 에러 처리 UI ---
    if (loading) {
        return (
            <LoadingSpinner message="관리자 페이지 데이터를 불러오는 중..." />
        );
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    // --- 렌더링 ---
    return (
        <div className="p-6 bg-[#111922] text-white min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold mb-6">
                관리자: 판매자 권한 관리
            </h2>

            {/* 탭 또는 섹션 구분 (예: 대기 중인 신청 / 전체 이력 / 현재 판매자) */}
            <div className="flex space-x-4 mb-8">
                {/* 각 탭을 클릭하면 해당 섹션이나 데이터를 보여주도록 UI 구성 */}
                {/* 여기서는 편의상 스크롤 가능한 단일 페이지로 구성 */}
            </div>

            {/* --- 대기 중인 판매자 신청 목록 (API-04-01) --- */}
            <section className="mb-10 bg-[#1a232f] p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                    🔔 대기 중인 판매자 신청 ({pendingApplications.length}건)
                </h3>
                {pendingApplications.length === 0 ? (
                    <p className="text-gray-400">
                        새로운 판매자 신청이 없습니다.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-[#243447]">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        신청 ID
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        유저 ID
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        아이디
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        닉네임
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        업체명
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        사업자번호
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        제출 서류
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        신청일
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        작업
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#1a232f] divide-y divide-gray-700">
                                {pendingApplications.map((app) => (
                                    <tr key={app.applicationId}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                            {app.applicationId}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {app.userId}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {app.username}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {app.userNickname}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {app.companyName}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {app.businessNumber}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                            {app.uploadedFileUrl ? (
                                                <a
                                                    href={app.uploadedFileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:underline"
                                                >
                                                    보기
                                                </a>
                                            ) : (
                                                '없음'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {new Date(
                                                app.createdAt,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Button
                                                    onClick={() =>
                                                        handleProcessClick(
                                                            app,
                                                            true,
                                                        )
                                                    }
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                                                >
                                                    승인
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleProcessClick(
                                                            app,
                                                            false,
                                                        )
                                                    }
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                                                >
                                                    반려
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleViewUserHistory(
                                                            app,
                                                        )
                                                    }
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                                                >
                                                    이력
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* --- 현재 판매자 목록 (API-04-05) --- */}
            <section className="mb-10 bg-[#1a232f] p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                    👥 현재 판매자 목록 ({currentSellers.length}명)
                </h3>
                {currentSellers.length === 0 ? (
                    <p className="text-gray-400">
                        현재 활동 중인 판매자가 없습니다.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-[#243447]">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        유저 ID
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        아이디
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        닉네임
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        작업
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#1a232f] divide-y divide-gray-700">
                                {currentSellers.map((seller) => (
                                    <tr key={seller.userId}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                            {seller.userId}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {seller.username}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {seller.userNickname}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Button
                                                    onClick={() =>
                                                        handleRevokeClick(
                                                            seller,
                                                        )
                                                    }
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                                                >
                                                    권한 해제
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleViewUserHistory(
                                                            seller,
                                                        )
                                                    }
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                                                >
                                                    이력
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* --- 전체 판매자 이력 목록 (API-04-06) --- */}
            <section className="bg-[#1a232f] p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                    📜 전체 판매자 권한 이력
                </h3>

                {/* 필터 및 검색 */}
                <div className="flex flex-wrap gap-4 mb-4">
                    <InputField
                        label="검색 (아이디, 닉네임, 업체명 등)"
                        name="searchKeyword"
                        value={searchKeyword}
                        onChange={handleKeywordChange}
                        placeholder="검색어를 입력하세요"
                        className="flex-1 min-w-[200px]"
                    />
                    <div className="flex-1 min-w-[150px]">
                        <label
                            htmlFor="typeFilter"
                            className="block text-sm font-medium text-gray-300 mb-2"
                        >
                            이력 타입 필터
                        </label>
                        <select
                            id="typeFilter"
                            value={typeFilter}
                            onChange={handleTypeFilterChange}
                            className="w-full p-3 bg-[#0A0D11] border border-[#243447] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                        >
                            {SELLER_HISTORY_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {STATUS_LABELS[type] || type}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {allHistory.length === 0 ? (
                    <p className="text-gray-400">표시할 이력이 없습니다.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-[#243447]">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        이력 ID
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        유저 ID
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        아이디
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        닉네임
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        타입
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        사유
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        일시
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        작업
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#1a232f] divide-y divide-gray-700">
                                {allHistory.map((history) => (
                                    <tr key={history.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                            {history.id}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {history.userId}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {history.username}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {history.userNickname}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {STATUS_LABELS[history.type] ||
                                                history.type}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {history.reason || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {new Date(
                                                history.createdAt,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <Button
                                                onClick={() =>
                                                    handleViewUserHistory(
                                                        history,
                                                    )
                                                }
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                                            >
                                                상세
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* 페이지네이션 */}
                        <div className="flex justify-center items-center space-x-2 mt-4">
                            <Button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 0}
                                className="px-3 py-1 text-xs"
                            >
                                이전
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <Button
                                    key={i}
                                    onClick={() => handlePageChange(i)}
                                    className={`px-3 py-1 text-xs ${currentPage === i ? 'bg-blue-500' : 'bg-gray-700'}`}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                            <Button
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage >= totalPages - 1}
                                className="px-3 py-1 text-xs"
                            >
                                다음
                            </Button>
                            <select
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                className="p-1 text-xs bg-[#0A0D11] border border-[#243447] rounded-lg text-white"
                            >
                                <option value={5}>5개</option>
                                <option value={10}>10개</option>
                                <option value={20}>20개</option>
                            </select>
                        </div>
                    </div>
                )}
            </section>

            {/* --- 판매자 신청 승인/반려 모달 --- */}
            {showProcessModal && selectedUser && (
                <Modal
                    isOpen={showProcessModal}
                    onClose={() => setShowProcessModal(false)}
                    title={
                        selectedUser.approveAction
                            ? '판매자 신청 승인'
                            : '판매자 신청 반려'
                    }
                >
                    <p className="mb-4 text-gray-300">
                        '{selectedUser.username}'({selectedUser.userNickname})
                        님의 판매자 신청을{' '}
                        {selectedUser.approveAction ? '승인' : '반려'}
                        하시겠습니까?
                    </p>
                    {!selectedUser.approveAction && ( // 반려 시에만 사유 입력 필드
                        <InputField
                            label="반려 사유"
                            name="processReason"
                            value={processReason}
                            onChange={(e) => {
                                setProcessReason(e.target.value);
                                setFormErrors({}); // 입력 시 에러 메시지 초기화
                            }}
                            placeholder="반려 사유를 입력하세요"
                            error={formErrors.reason}
                            required={true}
                            className="mb-4"
                        />
                    )}
                    <div className="flex justify-end space-x-2">
                        <Button
                            onClick={() => setShowProcessModal(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white"
                        >
                            취소
                        </Button>
                        <Button
                            onClick={confirmProcessApplication}
                            className={
                                selectedUser.approveAction
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                            }
                            disabled={
                                !selectedUser.approveAction &&
                                !processReason.trim()
                            }
                        >
                            {selectedUser.approveAction
                                ? '승인하기'
                                : '반려하기'}
                        </Button>
                    </div>
                </Modal>
            )}

            {/* --- 판매자 강제 권한 해제 모달 --- */}
            {showRevokeModal && selectedUser && (
                <Modal
                    isOpen={showRevokeModal}
                    onClose={() => setShowRevokeModal(false)}
                    title="판매자 권한 강제 해제"
                >
                    <p className="mb-4 text-gray-300">
                        '{selectedUser.username}'({selectedUser.userNickname})
                        님의 판매자 권한을 강제로 해제하시겠습니까? 이 작업은
                        되돌릴 수 없으며, 활성 콘서트가 있는 판매자는 해제할 수
                        없습니다.
                    </p>
                    <InputField
                        label="해제 사유"
                        name="revokeReason"
                        value={revokeReason}
                        onChange={(e) => {
                            setRevokeReason(e.target.value);
                            setFormErrors({});
                        }}
                        placeholder="강제 해제 사유를 입력하세요"
                        error={formErrors.reason}
                        required={true}
                        className="mb-4"
                    />
                    <div className="flex justify-end space-x-2">
                        <Button
                            onClick={() => setShowRevokeModal(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white"
                        >
                            취소
                        </Button>
                        <Button
                            onClick={confirmRevokeRole}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={!revokeReason.trim()}
                        >
                            권한 해제하기
                        </Button>
                    </div>
                </Modal>
            )}

            {/* --- 특정 유저 이력 상세 모달 (API-04-04) --- */}
            {showHistoryModal && selectedUser && (
                <Modal
                    isOpen={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                    title={`'${selectedUser.username}'(${selectedUser.userNickname}) 님의 권한 이력`}
                    size="large"
                >
                    {userHistory.length === 0 ? (
                        <p className="text-gray-400">
                            해당 유저의 이력이 없습니다.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-[#243447]">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            이력 ID
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            타입
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            사유
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            일시
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#1a232f] divide-y divide-gray-700">
                                    {userHistory.map((history) => (
                                        <tr key={history.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                                {history.id}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                {STATUS_LABELS[history.type] ||
                                                    history.type}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                {history.reason || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                {new Date(
                                                    history.createdAt,
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
};

export default AdminSellerManagement;
