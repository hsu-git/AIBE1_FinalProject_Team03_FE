// src/features/concert/components/ExpectationList.jsx

// ===== IMPORT 섹션 =====
import React, { useCallback, useState } from 'react';
// useCallback: 이벤트 핸들러 최적화

// 기대평 관련 타입과 상수들을 import
import {
    ExpectationRatingLabels,
    ExpectationRatingEmojis,
    ExpectationRatingColors,
} from '../types/expectation.js';

/**
 * ===== ExpectationList 컴포넌트 =====
 *
 * 🎯 주요 역할:
 * 1. **기대평 목록 표시**: 콘서트의 관람 전 기대평 목록을 카드 형태로 렌더링
 * 2. **기대점수 시각화**: 1-5점 기대점수를 별과 이모지로 표시
 * 3. **페이지네이션**: 페이지 이동 및 페이지 크기 변경 기능
 * 4. **상태 관리**: 로딩, 에러, 빈 상태 처리
 * 5. **기대평 액션**: 개별 기대평 클릭, 수정, 삭제 기능
 *
 * 🔄 Hook 연동:
 * - useExpectations hook과 완전 연동
 * - 자동 페이지네이션 처리
 * - 기대평 액션 이벤트 전달
 *
 * 💡 리뷰와의 차이점:
 * - 기대평: 관람 **전** 작성, 기대점수(1-5), 정렬 옵션 없음
 * - 리뷰: 관람 **후** 작성, 평점(1-5), 다양한 정렬 옵션
 *
 * 💡 사용 방법:
 * <ExpectationList
 *   expectations={expectations}
 *   loading={loading}
 *   onPageChange={goToPage}
 *   onExpectationClick={handleExpectationClick}
 * />
 */
const ExpectationList = ({
    // ===== 데이터 props (useExpectations hook에서) =====
    expectations = [], // 기대평 목록 (useExpectations.expectations)
    loading = false, // 로딩 상태 (useExpectations.loading)
    error = null, // 에러 상태 (useExpectations.error)

    // ===== 페이지네이션 props =====
    currentPage = 0, // 현재 페이지 (useExpectations.currentPage)
    totalPages = 0, // 전체 페이지 수 (useExpectations.totalPages)
    totalElements = 0, // 전체 기대평 수 (useExpectations.totalElements)
    pageSize = 10, // 페이지 크기 (useExpectations.pageSize)

    // ===== 액션 props =====
    onExpectationClick, // 기대평 클릭 핸들러 (상세보기 또는 수정)
    onPageChange, // 페이지 변경 핸들러 (useExpectations.goToPage)
    onPageSizeChange, // 페이지 크기 변경 핸들러 (useExpectations.changePageSize)
    onRefresh, // 새로고침 핸들러 (useExpectations.refresh)
    currentUserId, // 현재 사용자 ID
    onEditClick, // 수정 버튼 클릭 핸들러
    onDeleteClick, // 삭제 버튼 클릭 핸들러

    // ===== UI 제어 props =====
    showPagination = true, // 페이지네이션 표시 여부
    showRefreshButton = false, // 새로고침 버튼 표시 여부
    allowFiltering = false, // 기대점수별 필터링 허용 여부

    // ===== 스타일 props =====
    className = '', // 추가 CSS 클래스
    compact = false, // 컴팩트 모드 (간소화된 UI)
}) => {
    const [hoveredExpectationId, setHoveredExpectationId] = useState(null);

    // ===== 이벤트 핸들러들 =====

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
     * 기대평 클릭 핸들러
     */
    const handleExpectationClick = useCallback(
        (expectation) => {
            if (
                onExpectationClick &&
                typeof onExpectationClick === 'function'
            ) {
                onExpectationClick(expectation);
            }
        },
        [onExpectationClick],
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
     * 기대점수 별 표시 함수
     */
    const renderExpectationStars = useCallback(
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
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    };

    /**
     * 기대평 카드 스타일
     */
    const expectationCardStyles = {
        padding: compact ? '12px' : '16px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        marginBottom: '12px',
        backgroundColor: '#ffffff',
        cursor: onExpectationClick ? 'pointer' : 'default',
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
            <div
                className={`expectation-list ${className}`}
                style={containerStyles}
            >
                <div style={headerStyles}>
                    <div style={titleStyles}>✨ 기대평</div>
                </div>

                {/* 로딩 스켈레톤 */}
                <div>
                    {Array.from({ length: 3 }, (_, index) => (
                        <div
                            key={`skeleton-${index}`}
                            style={{
                                ...expectationCardStyles,
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
                                    width: '100%',
                                    height: '40px',
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
                    기대평을 불러오는 중...
                </div>
            </div>
        );
    }

    /**
     * 에러 상태
     */
    if (error) {
        return (
            <div
                className={`expectation-list ${className}`}
                style={containerStyles}
            >
                <div style={headerStyles}>
                    <div style={titleStyles}>✨ 기대평</div>
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
                        기대평을 불러올 수 없습니다
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
     * 기대평이 없는 상태
     */
    if (!expectations || expectations.length === 0) {
        return (
            <div
                className={`expectation-list ${className}`}
                style={containerStyles}
            >
                <div style={headerStyles}>
                    <div style={titleStyles}>
                        ✨ 기대평 (0개)
                        <span
                            style={{
                                fontSize: '11px',
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontWeight: 'normal',
                                marginLeft: '8px',
                            }}
                        >
                            관람 전
                        </span>
                    </div>
                </div>

                <div
                    style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                    }}
                >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        ✨
                    </div>
                    <h3
                        style={{
                            color: '#6b7280',
                            marginBottom: '8px',
                            fontSize: '18px',
                        }}
                    >
                        아직 작성된 기대평이 없습니다
                    </h3>
                    <p
                        style={{
                            color: '#9ca3af',
                            fontSize: '14px',
                        }}
                    >
                        공연 전에 기대평을 작성해보세요!
                    </p>

                    {!compact && (
                        <div
                            style={{
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: '#eff6ff',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#1e40af',
                            }}
                        >
                            💡 기대평은 관람 전에 작성하는 기대감 표현입니다
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ===== 메인 렌더링 (정상 상태) =====

    return (
        <div
            className={`expectation-list ${className}`}
            style={containerStyles}
        >
            {/* 헤더 */}
            <div style={headerStyles}>
                <div style={titleStyles}>
                    ✨ 기대평 ({totalElements.toLocaleString()}개)
                    <span
                        style={{
                            fontSize: '11px',
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontWeight: 'normal',
                            marginLeft: '8px',
                        }}
                    >
                        관람 전
                    </span>
                </div>

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

            {/* 기대평 목록 */}
            <div>
                {expectations.map((expectation) => (
                    <div
                        key={expectation.id}
                        style={{
                            ...expectationCardStyles,
                            ...(hoveredExpectationId === expectation.id &&
                            onExpectationClick
                                ? {
                                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                      transform: 'translateY(-1px)',
                                  }
                                : {}),
                        }}
                        onClick={() => handleExpectationClick(expectation)}
                        onMouseEnter={() =>
                            onExpectationClick &&
                            setHoveredExpectationId(expectation.id)
                        }
                        onMouseLeave={() => setHoveredExpectationId(null)}
                    >
                        {/* 기대평 헤더 */}
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
                                    {expectation.userNickname}
                                </span>
                                <span
                                    style={{
                                        fontSize: '11px',
                                        color: '#9ca3af',
                                    }}
                                >
                                    {formatDate(expectation.createdAt)}
                                </span>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                {renderExpectationStars(
                                    expectation.expectationRating,
                                )}
                                <span
                                    style={{
                                        fontSize: '12px',
                                        color: '#6b7280',
                                        marginLeft: '4px',
                                    }}
                                >
                                    ({expectation.expectationRating}/5)
                                </span>
                            </div>
                        </div>

                        {/* 기대평 내용 */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px',
                            }}
                        >
                            <span
                                style={{ fontSize: compact ? '18px' : '20px' }}
                            >
                                {
                                    ExpectationRatingEmojis[
                                        expectation.expectationRating
                                    ]
                                }
                            </span>
                            <span
                                style={{
                                    fontSize: compact ? '13px' : '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                }}
                            >
                                {
                                    ExpectationRatingLabels[
                                        expectation.expectationRating
                                    ]
                                }
                            </span>
                        </div>

                        {/* 기대평 텍스트 */}
                        <p
                            style={{
                                fontSize: compact ? '13px' : '14px',
                                color: '#6b7280',
                                lineHeight: '1.5',
                                margin: '0',
                            }}
                        >
                            {expectation.comment.length > 150 && !compact
                                ? expectation.comment.substring(0, 150) + '...'
                                : expectation.comment}
                        </p>
                        {/* 수정/삭제 버튼 (작성자만) */}
                        {currentUserId === expectation.userId && (
                            <div
                                style={{
                                    marginTop: '8px',
                                    display: 'flex',
                                    gap: '8px',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditClick?.(expectation);
                                    }}
                                    style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#3b82f6',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ✏️ 수정
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteClick?.(expectation);
                                    }}
                                    style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#ef4444',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    🗑️ 삭제
                                </button>
                            </div>
                        )}
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

            {/* 기대평 vs 리뷰 안내 */}
            {!compact && totalElements > 0 && (
                <div
                    style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#fef9e7',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#a16207',
                    }}
                >
                    💡 기대평은 공연 관람 <strong>전</strong>에 작성하는
                    기대감이며, 관람 <strong>후</strong>에는 리뷰를 작성하실 수
                    있습니다.
                </div>
            )}
        </div>
    );
};

// ===== 기본 PROPS =====
ExpectationList.defaultProps = {
    expectations: [],
    loading: false,
    error: null,
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
    showPagination: true,
    showRefreshButton: false,
    allowFiltering: false,
    className: '',
    compact: false,
};

export default ExpectationList;
