// src/features/concert/components/ConcertList.jsx

// React 라이브러리에서 필요한 기능들을 import
import React from 'react';

// 우리가 만든 ConcertCard 컴포넌트 import
import ConcertCard from './ConcertCard.jsx';

/**
 * ConcertList 컴포넌트
 *
 * 🎯 역할:
 * - 여러 개의 ConcertCard 컴포넌트를 담는 컨테이너
 * - 콘서트 목록을 격자(그리드) 형태로 배치
 * - 로딩, 에러, 빈 상태 등 다양한 상황에 대한 UI 제공
 * - 페이지네이션 UI 제공 (페이지 번호, 이전/다음 버튼)
 *
 * 📋 제공하는 기능:
 * - 콘서트 카드들의 반응형 격자 레이아웃
 * - 로딩 중 스켈레톤 UI 또는 스피너 표시
 * - 검색 결과 없음 메시지
 * - 에러 발생 시 에러 메시지와 재시도 버튼
 * - 페이지 이동 버튼들 (이전, 다음, 페이지 번호)
 *
 * 🔄 사용 방법:
 * <ConcertList
 *   concerts={concerts}
 *   loading={loading}
 *   error={error}
 *   onConcertClick={handleConcertClick}
 *   onPageChange={handlePageChange}
 *   currentPage={0}
 *   totalPages={5}
 * />
 *
 * @param {Object} props - 컴포넌트에 전달되는 속성들
 * @param {Array} props.concerts - 표시할 콘서트 목록 배열 (필수)
 * @param {boolean} props.loading - 로딩 중인지 여부 (선택사항, 기본값: false)
 * @param {string|Error} props.error - 에러 메시지 또는 에러 객체 (선택사항)
 * @param {Function} props.onConcertClick - 콘서트 카드 클릭 시 실행될 함수 (선택사항)
 * @param {Function} props.onPageChange - 페이지 변경 시 실행될 함수 (선택사항)
 * @param {Function} props.onRetry - 에러 상황에서 재시도 버튼 클릭 시 실행될 함수 (선택사항)
 * @param {number} props.currentPage - 현재 페이지 번호 (선택사항, 기본값: 0)
 * @param {number} props.totalPages - 전체 페이지 수 (선택사항, 기본값: 0)
 * @param {boolean} props.showAiSummary - AI 요약 표시 여부 (선택사항, 기본값: false)
 * @param {boolean} props.showPagination - 페이지네이션 표시 여부 (선택사항, 기본값: true)
 * @param {string} props.emptyMessage - 빈 목록일 때 표시할 메시지 (선택사항)
 * @param {string} props.className - 추가 CSS 클래스 (선택사항)
 * @returns {JSX.Element} 렌더링될 JSX 요소
 */
const ConcertList = ({
    concerts = [],
    loading = false,
    error = null,
    onConcertClick,
    onPageChange,
    onRetry,
    currentPage = 0,
    totalPages = 0,
    showAiSummary = false,
    showPagination = true,
    emptyMessage = '콘서트가 없습니다.',
    className = '',
}) => {
    // ===== 스타일 정의 =====

    /**
     * 컨테이너의 기본 스타일
     */
    const containerStyles = {
        width: '100%',
        padding: '16px',
    };

    /**
     * 콘서트 목록 격자 레이아웃 스타일
     * CSS Grid를 사용하여 반응형 레이아웃 구현
     */
    const gridStyles = {
        display: 'grid',
        // 반응형 그리드: 최소 280px, 최대 1fr (가능한 공간 차지)
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
    };

    /**
     * 로딩 스피너 스타일
     */
    const loadingStyles = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        fontSize: '16px',
        color: '#6b7280',
    };

    /**
     * 에러 메시지 스타일
     */
    const errorStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        padding: '24px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '16px 0',
    };

    /**
     * 빈 상태 메시지 스타일
     */
    const emptyStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        padding: '24px',
        backgroundColor: '#f9fafb',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        margin: '16px 0',
    };

    /**
     * 페이지네이션 컨테이너 스타일
     */
    const paginationStyles = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginTop: '24px',
        padding: '16px',
    };

    /**
     * 페이지네이션 버튼 기본 스타일
     */
    const buttonBaseStyles = {
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s ease',
    };

    /**
     * 활성 페이지 버튼 스타일
     */
    const activeButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        borderColor: '#3b82f6',
    };

    /**
     * 비활성 버튼 스타일
     */
    const disabledButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: '#f3f4f6',
        color: '#9ca3af',
        cursor: 'not-allowed',
    };

    // ===== 이벤트 핸들러 =====

    /**
     * 페이지 변경 핸들러
     *
     * @param {number} newPage - 이동할 페이지 번호
     */
    const handlePageChange = (newPage) => {
        // 유효한 페이지 범위인지 확인
        if (newPage < 0 || newPage >= totalPages) {
            return;
        }

        // 현재 페이지와 같으면 아무 작업 안 함
        if (newPage === currentPage) {
            return;
        }

        // 부모 컴포넌트에서 전달받은 페이지 변경 함수 실행
        if (onPageChange && typeof onPageChange === 'function') {
            onPageChange(newPage);
        }
    };

    /**
     * 재시도 버튼 클릭 핸들러
     */
    const handleRetry = () => {
        if (onRetry && typeof onRetry === 'function') {
            onRetry();
        }
    };

    // ===== 헬퍼 함수 =====

    /**
     * 표시할 페이지 번호 배열을 생성하는 함수
     * 너무 많은 페이지가 있을 때 일부만 표시 (예: 1 2 3 ... 8 9 10)
     *
     * @returns {Array} 표시할 페이지 번호 배열
     */
    const getVisiblePageNumbers = () => {
        const visiblePages = [];
        const maxVisiblePages = 5; // 최대 5개 페이지 번호만 표시

        if (totalPages <= maxVisiblePages) {
            // 전체 페이지가 5개 이하면 모두 표시
            for (let i = 0; i < totalPages; i++) {
                visiblePages.push(i);
            }
        } else {
            // 현재 페이지를 중심으로 앞뒤 2개씩 표시
            const start = Math.max(0, currentPage - 2);
            const end = Math.min(totalPages - 1, currentPage + 2);

            for (let i = start; i <= end; i++) {
                visiblePages.push(i);
            }

            // 첫 페이지가 포함되지 않았으면 추가
            if (start > 0) {
                visiblePages.unshift(0);
                if (start > 1) {
                    visiblePages.splice(1, 0, '...');
                }
            }

            // 마지막 페이지가 포함되지 않았으면 추가
            if (end < totalPages - 1) {
                if (end < totalPages - 2) {
                    visiblePages.push('...');
                }
                visiblePages.push(totalPages - 1);
            }
        }

        return visiblePages;
    };

    // ===== 로딩 스켈레톤 컴포넌트 =====

    /**
     * 로딩 중일 때 표시할 스켈레톤 카드들
     * 실제 카드와 비슷한 크기의 회색 박스들을 보여줌
     */
    const LoadingSkeleton = () => {
        const skeletonCards = Array.from({ length: 6 }, (_, index) => (
            <div
                key={`skeleton-${index}`}
                style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                }}
            >
                {/* 포스터 이미지 영역 */}
                <div
                    style={{
                        width: '100%',
                        height: '200px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        marginBottom: '12px',
                    }}
                />

                {/* 제목 영역 */}
                <div
                    style={{
                        width: '80%',
                        height: '20px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        marginBottom: '8px',
                    }}
                />

                {/* 아티스트 영역 */}
                <div
                    style={{
                        width: '60%',
                        height: '16px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        marginBottom: '8px',
                    }}
                />

                {/* 날짜/장소 영역 */}
                <div
                    style={{
                        width: '90%',
                        height: '14px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        marginBottom: '6px',
                    }}
                />

                <div
                    style={{
                        width: '70%',
                        height: '14px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                    }}
                />
            </div>
        ));

        return <div style={gridStyles}>{skeletonCards}</div>;
    };

    // ===== 조건부 렌더링 =====

    /**
     * 로딩 중일 때
     */
    if (loading) {
        return (
            <div
                className={`concert-list ${className}`}
                style={containerStyles}
            >
                <LoadingSkeleton />
                <div style={loadingStyles}>
                    <span>🎵 콘서트 정보를 불러오는 중...</span>
                </div>
            </div>
        );
    }

    /**
     * 에러가 발생했을 때
     */
    if (error) {
        return (
            <div
                className={`concert-list ${className}`}
                style={containerStyles}
            >
                <div style={errorStyles}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        😵
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>
                        오류가 발생했습니다
                    </h3>
                    <p
                        style={{
                            margin: '0 0 16px 0',
                            color: '#6b7280',
                            textAlign: 'center',
                        }}
                    >
                        {typeof error === 'string'
                            ? error
                            : '콘서트 정보를 불러올 수 없습니다.'}
                    </p>
                    {onRetry && (
                        <button
                            onClick={handleRetry}
                            style={{
                                ...buttonBaseStyles,
                                backgroundColor: '#dc2626',
                                color: '#ffffff',
                                borderColor: '#dc2626',
                            }}
                        >
                            🔄 다시 시도
                        </button>
                    )}
                </div>
            </div>
        );
    }

    /**
     * 콘서트 목록이 비어있을 때
     */
    if (!concerts || concerts.length === 0) {
        return (
            <div
                className={`concert-list ${className}`}
                style={containerStyles}
            >
                <div style={emptyStyles}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        🎭
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>
                        콘서트가 없습니다
                    </h3>
                    <p
                        style={{
                            margin: '0',
                            color: '#6b7280',
                            textAlign: 'center',
                        }}
                    >
                        {emptyMessage}
                    </p>
                </div>
            </div>
        );
    }

    // ===== 메인 렌더링 (정상 상태) =====

    return (
        <div className={`concert-list ${className}`} style={containerStyles}>
            {/* 콘서트 카드들의 격자 레이아웃 */}
            <div style={gridStyles}>
                {concerts.map((concert) => (
                    <ConcertCard
                        key={concert.concertId}
                        concert={concert}
                        onClick={onConcertClick}
                        showAiSummary={showAiSummary}
                    />
                ))}
            </div>

            {/* 페이지네이션 (showPagination이 true이고 페이지가 2개 이상일 때만 표시) */}
            {showPagination && totalPages > 1 && (
                <div style={paginationStyles}>
                    {/* 이전 페이지 버튼 */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        style={
                            currentPage === 0
                                ? disabledButtonStyles
                                : buttonBaseStyles
                        }
                        aria-label="이전 페이지"
                    >
                        ← 이전
                    </button>

                    {/* 페이지 번호 버튼들 */}
                    {getVisiblePageNumbers().map((pageNum, index) => {
                        // "..." 표시인 경우
                        if (pageNum === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    style={{ padding: '8px 4px' }}
                                >
                                    ...
                                </span>
                            );
                        }

                        // 실제 페이지 번호인 경우
                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                style={
                                    pageNum === currentPage
                                        ? activeButtonStyles
                                        : buttonBaseStyles
                                }
                                aria-label={`${pageNum + 1}페이지`}
                                aria-current={
                                    pageNum === currentPage ? 'page' : undefined
                                }
                            >
                                {pageNum + 1}
                            </button>
                        );
                    })}

                    {/* 다음 페이지 버튼 */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        style={
                            currentPage >= totalPages - 1
                                ? disabledButtonStyles
                                : buttonBaseStyles
                        }
                        aria-label="다음 페이지"
                    >
                        다음 →
                    </button>
                </div>
            )}

            {/* 페이지 정보 표시 (현재 페이지 / 전체 페이지) */}
            {showPagination && totalPages > 0 && (
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '8px',
                        fontSize: '14px',
                        color: '#6b7280',
                    }}
                >
                    {currentPage + 1} / {totalPages} 페이지
                </div>
            )}
        </div>
    );
};

// ===== 기본 props 값 =====
ConcertList.defaultProps = {
    concerts: [],
    loading: false,
    error: null,
    currentPage: 0,
    totalPages: 0,
    showAiSummary: false,
    showPagination: true,
    emptyMessage: '콘서트가 없습니다.',
    className: '',
};

// 컴포넌트를 다른 파일에서 import할 수 있도록 export
export default ConcertList;
