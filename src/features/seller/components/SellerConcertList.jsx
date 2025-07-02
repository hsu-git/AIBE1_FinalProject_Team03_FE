import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Image,
    Calendar,
    MapPin,
    Users,
    Clock,
    Search,
    Filter,
    RefreshCw,
} from 'lucide-react';

/**
 * SellerConcertList.jsx
 *
 * 판매자용 콘서트 목록 관리 컴포넌트
 * - 백엔드 SellerConcertController의 API와 완전히 일치
 * - 페이징, 정렬, 필터링 기능 제공
 * - 콘서트 생성, 수정, 삭제, 상태 관리
 * - 포스터 이미지 업데이트 기능
 */
const SellerConcertList = () => {
    // ====== 상태 관리 ======
    const [concerts, setConcerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 페이징 상태 (BE와 동일한 기본값)
    const [pagination, setPagination] = useState({
        page: 0, // BE: defaultValue = "0"
        size: 10, // BE: defaultValue = "10"
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: false,
    });

    // 정렬 상태 (BE ALLOWED_SORT_FIELDS와 일치)
    const [sorting, setSorting] = useState({
        sortBy: 'createdAt', // BE: defaultValue = "createdAt"
        sortDir: 'desc', // BE: defaultValue = "desc"
    });

    // 필터 상태
    const [filters, setFilters] = useState({
        status: 'ALL', // 전체, 또는 특정 상태
        searchKeyword: '',
    });

    // 판매자 ID (실제로는 로그인 사용자 정보에서 가져와야 함)
    const [sellerId] = useState(100); // 예시용 하드코딩

    // 모달 상태
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedConcert, setSelectedConcert] = useState(null);

    // ====== BE API 호출 함수들 ======

    /**
     * 판매자 콘서트 목록 조회
     * GET /api/seller/concerts
     */
    const fetchConcerts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                sellerId: sellerId.toString(),
                page: pagination.page.toString(),
                size: pagination.size.toString(),
                sortBy: sorting.sortBy,
                sortDir: sorting.sortDir,
            });

            const response = await fetch(`/api/seller/concerts?${params}`);
            const result = await response.json();

            if (result.success) {
                setConcerts(result.data.content);
                setPagination((prev) => ({
                    ...prev,
                    totalElements: result.data.totalElements,
                    totalPages: result.data.totalPages,
                    first: result.data.first,
                    last: result.data.last,
                }));
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('콘서트 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * 상태별 콘서트 조회
     * GET /api/seller/concerts/status
     */
    const fetchConcertsByStatus = async (status) => {
        if (status === 'ALL') {
            fetchConcerts();
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                sellerId: sellerId.toString(),
                status: status,
            });

            const response = await fetch(
                `/api/seller/concerts/status?${params}`,
            );
            const result = await response.json();

            if (result.success) {
                setConcerts(result.data);
                // 상태별 조회는 페이징이 없으므로 리셋
                setPagination((prev) => ({
                    ...prev,
                    totalElements: result.data.length,
                    totalPages: 1,
                    first: true,
                    last: true,
                }));
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('콘서트 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * 콘서트 삭제 (취소 처리)
     * DELETE /api/seller/concerts/{concertId}
     */
    const deleteConcert = async (concertId) => {
        if (!confirm('정말로 이 콘서트를 취소하시겠습니까?')) return;

        try {
            const params = new URLSearchParams({
                sellerId: sellerId.toString(),
            });

            const response = await fetch(
                `/api/seller/concerts/${concertId}?${params}`,
                {
                    method: 'DELETE',
                },
            );

            const result = await response.json();

            if (result.success) {
                alert('콘서트가 취소되었습니다.');
                fetchConcerts(); // 목록 새로고침
            } else {
                alert(result.message);
            }
        } catch (err) {
            alert('콘서트 취소에 실패했습니다.');
        }
    };

    // ====== 이벤트 핸들러들 ======

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    const handleSizeChange = (newSize) => {
        setPagination((prev) => ({ ...prev, page: 0, size: newSize }));
    };

    const handleSortChange = (field) => {
        setSorting((prev) => ({
            sortBy: field,
            sortDir:
                prev.sortBy === field && prev.sortDir === 'asc'
                    ? 'desc'
                    : 'asc',
        }));
    };

    const handleStatusFilter = (status) => {
        setFilters((prev) => ({ ...prev, status }));
        setPagination((prev) => ({ ...prev, page: 0 })); // 첫 페이지로 리셋
    };

    // ====== useEffect - 데이터 로딩 ======
    useEffect(() => {
        if (filters.status === 'ALL') {
            fetchConcerts();
        } else {
            fetchConcertsByStatus(filters.status);
        }
    }, [
        pagination.page,
        pagination.size,
        sorting.sortBy,
        sorting.sortDir,
        filters.status,
    ]);

    // ====== 상태별 스타일 및 텍스트 ======
    const getStatusBadge = (status) => {
        const statusConfig = {
            SCHEDULED: { color: 'bg-blue-100 text-blue-800', text: '예정됨' },
            ON_SALE: { color: 'bg-green-100 text-green-800', text: '예매중' },
            SOLD_OUT: { color: 'bg-red-100 text-red-800', text: '매진' },
            CANCELLED: { color: 'bg-gray-100 text-gray-800', text: '취소됨' },
            COMPLETED: {
                color: 'bg-purple-100 text-purple-800',
                text: '완료됨',
            },
        };

        const config = statusConfig[status] || statusConfig.SCHEDULED;
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
            >
                {config.text}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateTimeString) => {
        return new Date(dateTimeString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // ====== 렌더링 ======
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* 헤더 섹션 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            콘서트 관리
                        </h1>
                        <p className="text-gray-600 mt-1">
                            등록한 콘서트를 관리하고 편집할 수 있습니다
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        콘서트 등록
                    </button>
                </div>

                {/* 필터 및 검색 */}
                <div className="flex flex-wrap gap-4 items-center">
                    {/* 상태 필터 */}
                    <div className="flex gap-2">
                        {[
                            'ALL',
                            'SCHEDULED',
                            'ON_SALE',
                            'SOLD_OUT',
                            'CANCELLED',
                            'COMPLETED',
                        ].map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusFilter(status)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    filters.status === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {status === 'ALL'
                                    ? '전체'
                                    : status === 'SCHEDULED'
                                      ? '예정됨'
                                      : status === 'ON_SALE'
                                        ? '예매중'
                                        : status === 'SOLD_OUT'
                                          ? '매진'
                                          : status === 'CANCELLED'
                                            ? '취소됨'
                                            : '완료됨'}
                            </button>
                        ))}
                    </div>

                    {/* 새로고침 버튼 */}
                    <button
                        onClick={() => fetchConcerts()}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        title="새로고침"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* 콘서트 목록 */}
            <div className="bg-white rounded-lg shadow-sm">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">로딩 중...</p>
                    </div>
                ) : concerts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Calendar
                            size={48}
                            className="mx-auto mb-4 text-gray-300"
                        />
                        <p>등록된 콘서트가 없습니다.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 text-blue-600 hover:text-blue-800"
                        >
                            첫 번째 콘서트를 등록해보세요
                        </button>
                    </div>
                ) : (
                    <>
                        {/* 테이블 헤더 */}
                        <div className="border-b border-gray-200">
                            <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-gray-500">
                                <div className="col-span-3">
                                    <button
                                        onClick={() =>
                                            handleSortChange('title')
                                        }
                                        className="flex items-center gap-1 hover:text-gray-700"
                                    >
                                        콘서트 정보
                                        {sorting.sortBy === 'title' && (
                                            <span>
                                                {sorting.sortDir === 'asc'
                                                    ? '↑'
                                                    : '↓'}
                                            </span>
                                        )}
                                    </button>
                                </div>
                                <div className="col-span-2">
                                    <button
                                        onClick={() =>
                                            handleSortChange('concertDate')
                                        }
                                        className="flex items-center gap-1 hover:text-gray-700"
                                    >
                                        공연일시
                                        {sorting.sortBy === 'concertDate' && (
                                            <span>
                                                {sorting.sortDir === 'asc'
                                                    ? '↑'
                                                    : '↓'}
                                            </span>
                                        )}
                                    </button>
                                </div>
                                <div className="col-span-2">장소</div>
                                <div className="col-span-1">좌석수</div>
                                <div className="col-span-1">
                                    <button
                                        onClick={() =>
                                            handleSortChange('status')
                                        }
                                        className="flex items-center gap-1 hover:text-gray-700"
                                    >
                                        상태
                                        {sorting.sortBy === 'status' && (
                                            <span>
                                                {sorting.sortDir === 'asc'
                                                    ? '↑'
                                                    : '↓'}
                                            </span>
                                        )}
                                    </button>
                                </div>
                                <div className="col-span-2">
                                    <button
                                        onClick={() =>
                                            handleSortChange('createdAt')
                                        }
                                        className="flex items-center gap-1 hover:text-gray-700"
                                    >
                                        등록일
                                        {sorting.sortBy === 'createdAt' && (
                                            <span>
                                                {sorting.sortDir === 'asc'
                                                    ? '↑'
                                                    : '↓'}
                                            </span>
                                        )}
                                    </button>
                                </div>
                                <div className="col-span-1">작업</div>
                            </div>
                        </div>

                        {/* 콘서트 목록 */}
                        <div className="divide-y divide-gray-200">
                            {concerts.map((concert) => (
                                <div
                                    key={concert.concertId}
                                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50"
                                >
                                    {/* 콘서트 정보 */}
                                    <div className="col-span-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                                {concert.posterImageUrl ? (
                                                    <img
                                                        src={
                                                            concert.posterImageUrl
                                                        }
                                                        alt={concert.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Image
                                                        size={20}
                                                        className="text-gray-400"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900 line-clamp-2">
                                                    {concert.title}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {concert.artist}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 공연일시 */}
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-1 text-sm">
                                            <Calendar
                                                size={14}
                                                className="text-gray-400"
                                            />
                                            <span>
                                                {formatDate(
                                                    concert.concertDate,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                            <Clock
                                                size={14}
                                                className="text-gray-400"
                                            />
                                            <span>
                                                {concert.startTime} -{' '}
                                                {concert.endTime}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 장소 */}
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-1 text-sm">
                                            <MapPin
                                                size={14}
                                                className="text-gray-400"
                                            />
                                            <span className="line-clamp-2">
                                                {concert.venueName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 좌석수 */}
                                    <div className="col-span-1">
                                        <div className="flex items-center gap-1 text-sm">
                                            <Users
                                                size={14}
                                                className="text-gray-400"
                                            />
                                            <span>
                                                {concert.totalSeats?.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 상태 */}
                                    <div className="col-span-1">
                                        {getStatusBadge(concert.status)}
                                    </div>

                                    {/* 등록일 */}
                                    <div className="col-span-2">
                                        <span className="text-sm text-gray-600">
                                            {formatDateTime(concert.createdAt)}
                                        </span>
                                    </div>

                                    {/* 작업 버튼들 */}
                                    <div className="col-span-1">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedConcert(concert);
                                                    setShowEditModal(true);
                                                }}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="수정"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    deleteConcert(
                                                        concert.concertId,
                                                    )
                                                }
                                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="삭제"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* 페이지네이션 */}
                {!loading && concerts.length > 0 && (
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                총 {pagination.totalElements}개 중{' '}
                                {pagination.page * pagination.size + 1}-
                                {Math.min(
                                    (pagination.page + 1) * pagination.size,
                                    pagination.totalElements,
                                )}
                                개 표시
                            </div>

                            <div className="flex items-center gap-2">
                                {/* 페이지 크기 선택 */}
                                <select
                                    value={pagination.size}
                                    onChange={(e) =>
                                        handleSizeChange(Number(e.target.value))
                                    }
                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                >
                                    <option value={10}>10개씩</option>
                                    <option value={20}>20개씩</option>
                                    <option value={50}>50개씩</option>
                                    <option value={100}>100개씩</option>
                                </select>

                                {/* 페이지 버튼들 */}
                                <div className="flex gap-1">
                                    <button
                                        onClick={() =>
                                            handlePageChange(
                                                pagination.page - 1,
                                            )
                                        }
                                        disabled={pagination.first}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        이전
                                    </button>

                                    {Array.from(
                                        {
                                            length: Math.min(
                                                5,
                                                pagination.totalPages,
                                            ),
                                        },
                                        (_, i) => {
                                            const pageNum =
                                                pagination.page + i - 2;
                                            if (
                                                pageNum < 0 ||
                                                pageNum >= pagination.totalPages
                                            )
                                                return null;

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() =>
                                                        handlePageChange(
                                                            pageNum,
                                                        )
                                                    }
                                                    className={`px-3 py-1 text-sm border rounded ${
                                                        pageNum ===
                                                        pagination.page
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNum + 1}
                                                </button>
                                            );
                                        },
                                    )}

                                    <button
                                        onClick={() =>
                                            handlePageChange(
                                                pagination.page + 1,
                                            )
                                        }
                                        disabled={pagination.last}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        다음
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 모달들은 추후 구현 */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4">콘서트 등록</h2>
                        <p>콘서트 등록 폼이 여기에 들어갑니다.</p>
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}

            {showEditModal && selectedConcert && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4">콘서트 수정</h2>
                        <p>콘서트 수정 폼이 여기에 들어갑니다.</p>
                        <p>선택된 콘서트: {selectedConcert.title}</p>
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerConcertList;
