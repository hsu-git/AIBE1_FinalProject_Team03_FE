// src/features/concert/components/ReviewList.jsx

// ===== IMPORT 섹션 =====
import React, { useCallback, useState } from 'react';
// useCallback: 이벤트 핸들러 최적화

// 리뷰 관련 타입과 상수들을 import
import {
    RatingLabels,
    RatingEmojis,
    RatingColors,
    ReviewSortOptions,
    SortDirectionOptions,
} from '../types/review.js';

/**
 * ===== ReviewList 컴포넌트 =====
 *
 * 🎯 주요 역할:
 * 1. **리뷰 목록 표시**: 콘서트의 관람 후기 목록을 카드 형태로 렌더링
 * 2. **정렬 기능**: 최신순, 평점순, 제목순 정렬 지원
 * 3. **페이지네이션**: 페이지 이동 및 페이지 크기 변경 기능
 * 4. **상태 관리**: 로딩, 에러, 빈 상태 처리
 * 5. **리뷰 액션**: 개별 리뷰 클릭, 수정, 삭제 기능
 *
 * 🔄 Hook 연동:
 * - useReviews hook과 완전 연동
 * - 자동 정렬 및 페이지네이션 처리
 * - 리뷰 액션 이벤트 전달
 *
 * 💡 사용 방법:
 * <ReviewList
 *   reviews={reviews}
 *   loading={loading}
 *   onSortChange={changeSorting}
 *   onPageChange={goToPage}
 * />
 */
const ReviewList = ({
    // ===== 데이터 props (useReviews hook에서) =====
    reviews = [], // 리뷰 목록 (useReviews.reviews)
    loading = false, // 로딩 상태 (useReviews.loading)
    error = null, // 에러 상태 (useReviews.error)

    // ===== 페이지네이션 props =====
    currentPage = 0, // 현재 페이지 (useReviews.currentPage)
    totalPages = 0, // 전체 페이지 수 (useReviews.totalPages)
    totalElements = 0, // 전체 리뷰 수 (useReviews.totalElements)
    pageSize = 10, // 페이지 크기 (useReviews.pageSize)

    // ===== 정렬 props =====
    sortBy = 'createdAt', // 정렬 기준 (useReviews.sortBy)
    sortDir = 'desc', // 정렬 방향 (useReviews.sortDir)

    // ===== 액션 props =====
    onReviewClick, // 리뷰 클릭 핸들러 (상세보기)
    onSortChange, // 정렬 변경 핸들러 (useReviews.changeSorting)
    onPageChange, // 페이지 변경 핸들러 (useReviews.goToPage)
    onPageSizeChange, // 페이지 크기 변경 핸들러 (useReviews.changePageSize)
    onRefresh, // 새로고침 핸들러 (useReviews.refresh)

    // ===== UI 제어 props =====
    showSortOptions = true, // 정렬 옵션 표시 여부
    showPagination = true, // 페이지네이션 표시 여부
    showRefreshButton = false, // 새로고침 버튼 표시 여부

    // ===== 스타일 props =====
    className = '', // 추가 CSS 클래스
    compact = false, // 컴팩트 모드 (간소화된 UI)
}) => {
    const [hoveredReviewId, setHoveredReviewId] = useState(null);
    // ===== 이벤트 핸들러들 =====

    /**
     * 정렬 변경 핸들러
     */
    const handleSortChange = (newSortBy) => {
        console.log('handleSortChange 호출됨:', newSortBy);
        if (onSortChange && typeof onSortChange === 'function') {
            const newSortDir =
                newSortBy === sortBy && sortDir === 'desc' ? 'asc' : 'desc';
            onSortChange(newSortBy, newSortDir);
        }
    };

    /**
     * 페이지 변경 핸들러
     */
    const handlePageChange = useCallback(
        (newPage) => {
            if (onPageChange && typeof onPageChange === 'function') {
                onPageChange(newPage);
            }
        },
        [onPageChange],
    );

    /**
     * 페이지 크기 변경 핸들러
     */
    const handlePageSizeChange = useCallback(
        (event) => {
            const newSize = parseInt(event.target.value, 10);
            if (onPageSizeChange && typeof onPageSizeChange === 'function') {
                onPageSizeChange(newSize);
            }
        },
        [onPageSizeChange],
    );

    /**
     * 리뷰 클릭 핸들러
     */
    const handleReviewClick = useCallback(
        (review) => {
            if (onReviewClick && typeof onReviewClick === 'function') {
                onReviewClick(review);
            }
        },
        [onReviewClick],
    );

    /**
     * 새로고침 핸들러
     */
    const handleRefresh = useCallback(() => {
        if (onRefresh && typeof onRefresh === 'function') {
            onRefresh();
        }
    }, [onRefresh]);

    // ===== 유틸리티 함수들 =====

    /**
     * 날짜 포맷팅 함수
     */
    const formatDate = useCallback((dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return dateString;
        }
    }, []);

    /**
     * 평점 별 표시 함수
     */
    const renderStars = useCallback(
        (rating) => {
            const stars = [];
            for (let i = 1; i <= 5; i++) {
                stars.push(
                    <span
                        key={i}
                        style={{
                            color: i <= rating ? '#fbbf24' : '#e5e7eb',
                            fontSize: compact ? '14px' : '16px',
                        }}
                    >
                        ★
                    </span>,
                );
            }
            return stars;
        },
        [compact],
    );

    /**
     * 표시할 페이지 번호 배열 생성
     */
    const getVisiblePageNumbers = useCallback(() => {
        const visiblePages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 0; i < totalPages; i++) {
                visiblePages.push(i);
            }
        } else {
            const start = Math.max(0, currentPage - 2);
            const end = Math.min(totalPages - 1, currentPage + 2);

            for (let i = start; i <= end; i++) {
                visiblePages.push(i);
            }

            if (start > 0) {
                visiblePages.unshift(0);
                if (start > 1) {
                    visiblePages.splice(1, 0, '...');
                }
            }

            if (end < totalPages - 1) {
                if (end < totalPages - 2) {
                    visiblePages.push('...');
                }
                visiblePages.push(totalPages - 1);
            }
        }

        return visiblePages;
    }, [currentPage, totalPages]);

    // ===== 스타일 정의 =====

    /**
     * 컨테이너 스타일
     */
    const containerStyles = {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: compact ? '12px' : '16px',
    };

    /**
     * 헤더 스타일
     */
    const headerStyles = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: compact ? '12px' : '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e5e7eb',
    };

    /**
     * 제목 스타일
     */
    const titleStyles = {
        fontSize: compact ? '16px' : '18px',
        fontWeight: 'bold',
        color: '#1f2937',
    };

    /**
     * 정렬 옵션 스타일
     */
    const sortContainerStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    };

    /**
     * 정렬 버튼 스타일
     */
    const getSortButtonStyles = (isActive) => ({
        padding: '4px 8px',
        backgroundColor: isActive ? '#3b82f6' : 'transparent',
        color: isActive ? '#ffffff' : '#6b7280',
        border: '1px solid ' + (isActive ? '#3b82f6' : '#d1d5db'),
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    });

    /**
     * 리뷰 카드 스타일
     */
    const reviewCardStyles = {
        padding: compact ? '12px' : '16px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        marginBottom: '12px',
        backgroundColor: '#ffffff',
        cursor: onReviewClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
    };

    /**
     * 페이지네이션 스타일
     */
    const paginationStyles = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginTop: '20px',
        padding: '12px',
    };

    /**
     * 페이지 버튼 기본 스타일
     */
    const pageButtonBaseStyles = {
        padding: '6px 12px',
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
    const activePageButtonStyles = {
        ...pageButtonBaseStyles,
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        borderColor: '#3b82f6',
    };

    // ===== 조건부 렌더링 =====

    /**
     * 로딩 상태
     */
    if (loading) {
        return (
            <div className={`review-list ${className}`} style={containerStyles}>
                <div style={headerStyles}>
                    <div style={titleStyles}>📝 관람 후기</div>
                </div>

                {/* 로딩 스켈레톤 */}
                <div>
                    {Array.from({ length: 3 }, (_, index) => (
                        <div
                            key={`skeleton-${index}`}
                            style={{
                                ...reviewCardStyles,
                                cursor: 'default',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '8px',
                                }}
                            >
                                <div
                                    style={{
                                        width: '100px',
                                        height: '16px',
                                        backgroundColor: '#e5e7eb',
                                        borderRadius: '4px',
                                        marginRight: '12px',
                                    }}
                                />
                                <div
                                    style={{
                                        width: '60px',
                                        height: '16px',
                                        backgroundColor: '#e5e7eb',
                                        borderRadius: '4px',
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    width: '80%',
                                    height: '20px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '4px',
                                    marginBottom: '8px',
                                }}
                            />
                            <div
                                style={{
                                    width: '100%',
                                    height: '16px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '4px',
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div
                    style={{
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: '14px',
                        marginTop: '16px',
                    }}
                >
                    리뷰를 불러오는 중...
                </div>
            </div>
        );
    }

    /**
     * 에러 상태
     */
    if (error) {
        return (
            <div className={`review-list ${className}`} style={containerStyles}>
                <div style={headerStyles}>
                    <div style={titleStyles}>📝 관람 후기</div>
                    {showRefreshButton && (
                        <button
                            onClick={handleRefresh}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                            }}
                        >
                            🔄 다시 시도
                        </button>
                    )}
                </div>

                <div
                    style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                    }}
                >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        😵
                    </div>
                    <h3
                        style={{
                            color: '#dc2626',
                            marginBottom: '8px',
                            fontSize: '18px',
                        }}
                    >
                        리뷰를 불러올 수 없습니다
                    </h3>
                    <p
                        style={{
                            color: '#6b7280',
                            fontSize: '14px',
                        }}
                    >
                        {typeof error === 'string'
                            ? error
                            : '알 수 없는 오류가 발생했습니다.'}
                    </p>
                </div>
            </div>
        );
    }

    /**
     * 리뷰가 없는 상태
     */
    if (!reviews || reviews.length === 0) {
        return (
            <div className={`review-list ${className}`} style={containerStyles}>
                <div style={headerStyles}>
                    <div style={titleStyles}>📝 관람 후기 (0개)</div>
                </div>

                <div
                    style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                    }}
                >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        📝
                    </div>
                    <h3
                        style={{
                            color: '#6b7280',
                            marginBottom: '8px',
                            fontSize: '18px',
                        }}
                    >
                        아직 작성된 후기가 없습니다
                    </h3>
                    <p
                        style={{
                            color: '#9ca3af',
                            fontSize: '14px',
                        }}
                    >
                        첫 번째 후기를 작성해보세요!
                    </p>
                </div>
            </div>
        );
    }

    // ===== 메인 렌더링 (정상 상태) =====

    return (
        <div className={`review-list ${className}`} style={containerStyles}>
            {/* 헤더 */}
            <div style={headerStyles}>
                <div style={titleStyles}>
                    📝 관람 후기 ({totalElements.toLocaleString()}개)
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    {/* 정렬 옵션 */}
                    {showSortOptions && (
                        <div style={sortContainerStyles}>
                            <span
                                style={{ fontSize: '12px', color: '#6b7280' }}
                            >
                                정렬:
                            </span>
                            {ReviewSortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() =>
                                        handleSortChange(option.value)
                                    }
                                    style={getSortButtonStyles(
                                        sortBy === option.value,
                                    )}
                                >
                                    {option.label}
                                    {sortBy === option.value && (
                                        <span style={{ marginLeft: '4px' }}>
                                            {sortDir === 'desc' ? '↓' : '↑'}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* 새로고침 버튼 */}
                    {showRefreshButton && (
                        <button
                            onClick={handleRefresh}
                            style={{
                                padding: '4px 8px',
                                backgroundColor: 'transparent',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#6b7280',
                                cursor: 'pointer',
                            }}
                        >
                            🔄
                        </button>
                    )}
                </div>
            </div>

            {/* 리뷰 목록 */}
            <div>
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        style={{
                            ...reviewCardStyles,
                            ...(hoveredReviewId === review.id && onReviewClick
                                ? {
                                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                      transform: 'translateY(-1px)',
                                  }
                                : {}),
                        }}
                        onClick={() => handleReviewClick(review)}
                        onMouseEnter={() =>
                            onReviewClick && setHoveredReviewId(review.id)
                        }
                        onMouseLeave={() => setHoveredReviewId(null)}
                    >
                        {/* 리뷰 헤더 */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: compact ? '12px' : '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                    }}
                                >
                                    {review.userNickname}
                                </span>
                                <span
                                    style={{
                                        fontSize: '11px',
                                        color: '#9ca3af',
                                    }}
                                >
                                    {formatDate(review.createdAt)}
                                </span>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                {renderStars(review.rating)}
                                <span
                                    style={{
                                        fontSize: '12px',
                                        color: '#6b7280',
                                        marginLeft: '4px',
                                    }}
                                >
                                    ({review.rating}/5)
                                </span>
                            </div>
                        </div>

                        {/* 리뷰 제목 */}
                        <h4
                            style={{
                                fontSize: compact ? '14px' : '16px',
                                fontWeight: '600',
                                color: '#1f2937',
                                marginBottom: '6px',
                                lineHeight: '1.4',
                            }}
                        >
                            {review.title}
                        </h4>

                        {/* 리뷰 내용 */}
                        <p
                            style={{
                                fontSize: compact ? '13px' : '14px',
                                color: '#6b7280',
                                lineHeight: '1.5',
                                margin: '0',
                            }}
                        >
                            {review.description.length > 100 && !compact
                                ? review.description.substring(0, 100) + '...'
                                : review.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* 페이지네이션 */}
            {showPagination && totalPages > 1 && (
                <div style={paginationStyles}>
                    {/* 이전 페이지 버튼 */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        style={{
                            ...pageButtonBaseStyles,
                            opacity: currentPage === 0 ? 0.5 : 1,
                            cursor:
                                currentPage === 0 ? 'not-allowed' : 'pointer',
                        }}
                    >
                        ← 이전
                    </button>

                    {/* 페이지 번호들 */}
                    {getVisiblePageNumbers().map((pageNum, index) => {
                        if (pageNum === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    style={{ padding: '6px 4px' }}
                                >
                                    ...
                                </span>
                            );
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                style={
                                    pageNum === currentPage
                                        ? activePageButtonStyles
                                        : pageButtonBaseStyles
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
                        style={{
                            ...pageButtonBaseStyles,
                            opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
                            cursor:
                                currentPage >= totalPages - 1
                                    ? 'not-allowed'
                                    : 'pointer',
                        }}
                    >
                        다음 →
                    </button>
                </div>
            )}

            {/* 페이지 크기 선택 */}
            {showPagination && totalElements > 10 && (
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '12px',
                    }}
                >
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        style={{
                            padding: '4px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: '#ffffff',
                        }}
                    >
                        <option value={10}>10개씩 보기</option>
                        <option value={20}>20개씩 보기</option>
                        <option value={50}>50개씩 보기</option>
                    </select>
                </div>
            )}
        </div>
    );
};

// ===== 기본 PROPS =====
ReviewList.defaultProps = {
    reviews: [],
    loading: false,
    error: null,
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDir: 'desc',
    showSortOptions: true,
    showPagination: true,
    showRefreshButton: false,
    className: '',
    compact: false,
};

export default ReviewList;
