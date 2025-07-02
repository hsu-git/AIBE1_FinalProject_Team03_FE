// src/features/concert/components/AISummary.jsx

// ===== IMPORT 섹션 =====
import React, { useState, useCallback } from 'react';
// useState: 펼치기/접기 상태 관리
// useCallback: 이벤트 핸들러 최적화

/**
 * ===== AISummary 컴포넌트 =====
 *
 * 🎯 주요 역할:
 * 1. **AI 생성 요약 표시**: 콘서트의 AI 생성 요약 텍스트 렌더링
 * 2. **로딩 상태 처리**: AI 요약 로딩 중 스켈레톤 UI 표시
 * 3. **에러 상태 처리**: AI 요약 생성 실패 시 적절한 메시지
 * 4. **텍스트 길이 관리**: 긴 요약의 경우 펼치기/접기 기능
 * 5. **접근성 지원**: 스크린 리더 및 키보드 탐색 지원
 *
 * 🔄 Hook 연동:
 * - useConcertDetail.aiSummary와 연동
 * - useConcertDetail.aiSummaryLoading 상태 반영
 * - useConcertDetail.fetchAISummary 새로고침 기능
 *
 * 💡 사용 방법:
 * <AISummary
 *   summary={aiSummary}
 *   loading={aiSummaryLoading}
 *   onRefresh={fetchAISummary}
 * />
 */
const AISummary = ({
    // ===== 필수 props =====
    summary, // AI 요약 텍스트 (useConcertDetail.aiSummary)
    loading = false, // AI 요약 로딩 상태 (useConcertDetail.aiSummaryLoading)

    // ===== 액션 props =====
    onRefresh, // 새로고침 함수 (useConcertDetail.fetchAISummary)

    // ===== UI 제어 props =====
    showRefreshButton = true, // 새로고침 버튼 표시 여부
    maxLength = 200, // 접기 상태에서 최대 표시 길이

    // ===== 스타일 props =====
    className = '', // 추가 CSS 클래스
    compact = false, // 컴팩트 모드
}) => {
    // ===== 상태 관리 =====

    /**
     * 텍스트 펼치기/접기 상태
     * 긴 요약문의 경우 사용자가 전체/요약 보기를 선택할 수 있음
     */
    const [isExpanded, setIsExpanded] = useState(false);

    // ===== 텍스트 처리 함수들 =====

    /**
     * 요약 텍스트가 길어서 줄여야 하는지 판단
     */
    const shouldTruncate = useCallback(() => {
        return summary && summary.length > maxLength;
    }, [summary, maxLength]);

    /**
     * 표시할 텍스트 결정 (전체 vs 일부)
     */
    const getDisplayText = useCallback(() => {
        if (!summary) return '';

        if (!shouldTruncate() || isExpanded) {
            return summary; // 짧은 텍스트이거나 펼친 상태면 전체 표시
        }

        // 접힌 상태면 maxLength만큼 자르고 "..." 추가
        return summary.substring(0, maxLength).trim() + '...';
    }, [summary, shouldTruncate, isExpanded, maxLength]);

    /**
     * AI 요약 상태 확인
     * - null: 아직 로드되지 않음
     * - 특정 메시지들: 요약이 없거나 실패
     * - 일반 텍스트: 실제 요약 내용
     */
    const getSummaryStatus = useCallback(() => {
        if (!summary) return 'empty';

        // 백엔드에서 오는 특정 메시지들 확인
        if (
            summary === 'AI 요약 정보가 아직 생성되지 않았습니다.' ||
            summary === 'AI 요약을 불러올 수 없습니다.'
        ) {
            return 'unavailable';
        }

        return 'available';
    }, [summary]);

    // ===== 이벤트 핸들러들 =====

    /**
     * 펼치기/접기 버튼 클릭 핸들러
     */
    const handleToggleExpand = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    /**
     * 새로고침 버튼 클릭 핸들러
     */
    const handleRefresh = useCallback(() => {
        if (onRefresh && typeof onRefresh === 'function') {
            onRefresh();
        }
    }, [onRefresh]);

    // ===== 스타일 정의 =====

    /**
     * 컨테이너 스타일
     */
    const containerStyles = {
        padding: compact ? '12px' : '16px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: compact ? '12px' : '16px',
    };

    /**
     * 헤더 스타일
     */
    const headerStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
    };

    /**
     * 제목 스타일
     */
    const titleStyles = {
        fontSize: compact ? '14px' : '16px',
        fontWeight: '600',
        color: '#1e40af',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    };

    /**
     * 새로고침 버튼 스타일
     */
    const refreshButtonStyles = {
        padding: '4px 8px',
        backgroundColor: 'transparent',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#64748b',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: loading ? 0.6 : 1,
    };

    /**
     * 요약 텍스트 스타일
     */
    const summaryTextStyles = {
        fontSize: compact ? '13px' : '14px',
        lineHeight: '1.6',
        color: '#374151',
        marginBottom: shouldTruncate() ? '8px' : '0',
    };

    /**
     * 펼치기/접기 버튼 스타일
     */
    const toggleButtonStyles = {
        padding: '4px 8px',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#3b82f6',
        fontSize: '12px',
        cursor: 'pointer',
        textDecoration: 'underline',
    };

    /**
     * 로딩 스켈레톤 스타일
     */
    const skeletonStyles = {
        height: '20px',
        backgroundColor: '#e2e8f0',
        borderRadius: '4px',
        marginBottom: '8px',
        animation: 'pulse 2s infinite',
    };

    // ===== 조건부 렌더링 =====

    /**
     * 로딩 상태
     */
    if (loading) {
        return (
            <div className={`ai-summary ${className}`} style={containerStyles}>
                <div style={headerStyles}>
                    <div style={titleStyles}>🤖 AI 요약</div>
                </div>

                {/* 로딩 스켈레톤 */}
                <div>
                    <div style={{ ...skeletonStyles, width: '100%' }} />
                    <div style={{ ...skeletonStyles, width: '85%' }} />
                    <div style={{ ...skeletonStyles, width: '92%' }} />
                </div>

                <div
                    style={{
                        fontSize: '12px',
                        color: '#64748b',
                        textAlign: 'center',
                        marginTop: '8px',
                    }}
                >
                    AI 요약을 생성하는 중...
                </div>

                {/* CSS 애니메이션 */}
                <style jsx>{`
                    @keyframes pulse {
                        0%,
                        100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.5;
                        }
                    }
                `}</style>
            </div>
        );
    }

    const summaryStatus = getSummaryStatus();

    /**
     * 요약이 없거나 생성되지 않은 상태
     */
    if (summaryStatus === 'empty' || summaryStatus === 'unavailable') {
        return (
            <div className={`ai-summary ${className}`} style={containerStyles}>
                <div style={headerStyles}>
                    <div style={titleStyles}>🤖 AI 요약</div>
                    {showRefreshButton && onRefresh && (
                        <button
                            onClick={handleRefresh}
                            style={refreshButtonStyles}
                            aria-label="AI 요약 새로고침"
                            disabled={loading}
                        >
                            🔄 새로고침
                        </button>
                    )}
                </div>

                <div
                    style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#6b7280',
                    }}
                >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                        🤷‍♂️
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                        {summaryStatus === 'empty'
                            ? 'AI 요약 정보가 없습니다'
                            : summary}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        리뷰가 충분히 쌓이면 AI 요약이 자동으로 생성됩니다
                    </div>
                </div>
            </div>
        );
    }

    // ===== 메인 렌더링 (정상 상태) =====

    return (
        <div className={`ai-summary ${className}`} style={containerStyles}>
            {/* 헤더 */}
            <div style={headerStyles}>
                <div style={titleStyles}>
                    🤖 AI 요약
                    <span
                        style={{
                            fontSize: '11px',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontWeight: 'normal',
                        }}
                    >
                        자동 생성
                    </span>
                </div>

                {showRefreshButton && onRefresh && (
                    <button
                        onClick={handleRefresh}
                        style={refreshButtonStyles}
                        aria-label="AI 요약 새로고침"
                        disabled={loading}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.backgroundColor = '#f1f5f9';
                                e.target.style.borderColor = '#94a3b8';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.borderColor = '#cbd5e1';
                            }
                        }}
                    >
                        🔄 새로고침
                    </button>
                )}
            </div>

            {/* AI 요약 텍스트 */}
            <div
                style={summaryTextStyles}
                role="article"
                aria-label="AI 생성 콘서트 요약"
            >
                {getDisplayText()}
            </div>

            {/* 펼치기/접기 버튼 */}
            {shouldTruncate() && (
                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={handleToggleExpand}
                        style={toggleButtonStyles}
                        aria-label={isExpanded ? '요약 접기' : '전체 보기'}
                    >
                        {isExpanded ? '▲ 접기' : '▼ 더보기'}
                    </button>
                </div>
            )}

            {/* AI 요약 설명 */}
            {!compact && (
                <div
                    style={{
                        marginTop: '12px',
                        padding: '8px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#1e40af',
                    }}
                >
                    💡 이 요약은 실제 관람객들의 후기를 바탕으로 AI가 자동
                    생성했습니다
                </div>
            )}
        </div>
    );
};

// ===== 기본 PROPS =====
AISummary.defaultProps = {
    loading: false,
    showRefreshButton: true,
    maxLength: 200,
    className: '',
    compact: false,
};

export default AISummary;
