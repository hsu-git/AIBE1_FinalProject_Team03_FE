// src/features/concert/components/ConcertDetail.jsx

// ===== IMPORT 섹션 =====
import React, { useEffect } from 'react';
// useEffect: 컴포넌트 마운트 시 콘서트 정보 로드

// 콘서트 관련 타입과 상수들을 import
import { ConcertStatusLabels, ConcertStatusColors } from '../types/concert.js';

/**
 * ===== ConcertDetail 컴포넌트 =====
 *
 * 🎯 주요 역할:
 * 1. **콘서트 상세 정보 표시**: 제목, 아티스트, 날짜, 장소 등 모든 정보
 * 2. **상태별 시각화**: 예매 중, 매진 등 상태에 따른 다른 UI
 * 3. **포스터 이미지 표시**: 이미지 로딩 에러 처리 포함
 * 4. **예매 정보 표시**: 예매 기간, 제한사항 등
 * 5. **로딩/에러 상태 처리**: 사용자 친화적 피드백
 *
 * 🔄 Hook 연동:
 * - useConcertDetail hook과 완전 연동
 * - 자동 데이터 로딩 및 상태 관리
 * - 에러 상황 자동 처리
 *
 * 💡 사용 방법:
 * <ConcertDetail concertId={123} onBookingClick={handleBooking} />
 */
const ConcertDetail = ({
    // ===== 필수 props =====
    concert, // 콘서트 상세 정보 객체 (useConcertDetail.concert)
    loading = false, // 로딩 상태 (useConcertDetail.loading)
    error = null, // 에러 상태 (useConcertDetail.error)

    // ===== 액션 props =====
    onBookingClick, // 예매하기 버튼 클릭 핸들러 (선택사항)
    isBooking = false,
    onRefresh, // 새로고침 버튼 클릭 핸들러 (선택사항)

    // ===== UI 제어 props =====
    showBookingButton = true, // 예매 버튼 표시 여부
    showRefreshButton = false, // 새로고침 버튼 표시 여부 (에러 시 자동 표시)

    // ===== 스타일 props =====
    className = '', // 추가 CSS 클래스
    compact = false, // 컴팩트 모드 (간소화된 정보만)
}) => {
    // ===== 데이터 가공 함수들 =====

    /**
     * 날짜와 시간을 사용자 친화적 형태로 변환
     * 예: "2025-08-15" + "19:00:00" → "2025년 8월 15일 (토) 오후 7:00"
     */
    const formatConcertDateTime = () => {
        if (!concert?.concertDate || !concert?.startTime) {
            return '날짜 미정';
        }

        try {
            // Date 객체 생성
            const dateTimeString = `${concert.concertDate}T${concert.startTime}`;
            const dateTime = new Date(dateTimeString);

            if (isNaN(dateTime.getTime())) {
                return '날짜 형식 오류';
            }

            // 날짜 포맷팅 (한국어)
            const dateOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short',
            };

            // 시간 포맷팅 (12시간제)
            const timeOptions = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };

            const formattedDate = dateTime.toLocaleDateString(
                'ko-KR',
                dateOptions,
            );
            const formattedTime = dateTime.toLocaleTimeString(
                'ko-KR',
                timeOptions,
            );

            return `${formattedDate} ${formattedTime}`;
        } catch (error) {
            console.warn('날짜 형식 변환 실패:', error);
            return `${concert.concertDate} ${concert.startTime}`;
        }
    };

    /**
     * 공연 종료 시간 포맷팅
     */
    const formatEndTime = () => {
        if (!concert?.endTime) return '';

        try {
            const endDateTime = new Date(
                `${concert.concertDate}T${concert.endTime}`,
            );
            return endDateTime.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch (error) {
            return concert.endTime;
        }
    };

    /**
     * 예매 기간 포맷팅
     */
    const formatBookingPeriod = () => {
        if (!concert?.bookingStartDate || !concert?.bookingEndDate) {
            return '예매 기간 미정';
        }

        try {
            const startDate = new Date(concert.bookingStartDate);
            const endDate = new Date(concert.bookingEndDate);

            const startFormatted = startDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            const endFormatted = endDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            return `${startFormatted} ~ ${endFormatted}`;
        } catch (error) {
            return '예매 기간 형식 오류';
        }
    };

    /**
     * 포스터 이미지 에러 처리
     */
    const handleImageError = (event) => {
        // 기본 이미지로 대체
        event.target.src = '/images/basic-poster-image.png';

        // 기본 이미지도 없으면 숨김
        event.target.onerror = () => {
            event.target.style.display = 'none';
        };
    };

    /**
     * 예매 버튼 클릭 핸들러
     */
    const handleBookingClick = () => {
        if (onBookingClick && typeof onBookingClick === 'function') {
            onBookingClick(concert);
        }
    };

    /**
     * 새로고침 버튼 클릭 핸들러
     */
    const handleRefreshClick = () => {
        if (onRefresh && typeof onRefresh === 'function') {
            onRefresh();
        }
    };

    // ===== 상태별 UI 결정 =====

    /**
     * 예매 버튼 표시 여부 및 텍스트 결정
     */
    const getBookingButtonInfo = () => {
        if (!concert || !showBookingButton) {
            return { show: false, text: '', disabled: true };
        }

        switch (concert.status) {
            case 'SCHEDULED':
                return {
                    show: true,
                    text: '예매 대기 중',
                    disabled: true,
                    style: { backgroundColor: '#fbbf24', color: '#92400e' },
                };
            case 'ON_SALE':
                return {
                    show: true,
                    text: '예매하기',
                    disabled: false,
                    style: { backgroundColor: '#059669', color: '#ffffff' },
                };
            case 'SOLD_OUT':
                return {
                    show: true,
                    text: '매진',
                    disabled: true,
                    style: { backgroundColor: '#dc2626', color: '#ffffff' },
                };
            case 'CANCELLED':
                return {
                    show: false,
                    text: '취소된 공연',
                    disabled: true,
                };
            case 'COMPLETED':
                return {
                    show: false,
                    text: '공연 완료',
                    disabled: true,
                };
            default:
                return {
                    show: true,
                    text: '상태 확인 중',
                    disabled: true,
                    style: { backgroundColor: '#6b7280', color: '#ffffff' },
                };
        }
    };

    // ===== 스타일 정의 =====

    /**
     * 컨테이너 스타일
     */
    const containerStyles = {
        maxWidth: compact ? '600px' : '800px',
        margin: '0 auto',
        padding: compact ? '16px' : '24px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
    };

    /**
     * 포스터 이미지 스타일
     */
    const posterStyles = {
        width: '100%',
        maxWidth: compact ? '200px' : '300px',
        height: compact ? '280px' : '400px',
        objectFit: 'cover',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    };

    /**
     * 제목 스타일
     */
    const titleStyles = {
        fontSize: compact ? '20px' : '28px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '8px',
        lineHeight: '1.2',
    };

    /**
     * 아티스트 스타일
     */
    const artistStyles = {
        fontSize: compact ? '16px' : '20px',
        color: '#6b7280',
        marginBottom: '16px',
        fontWeight: '500',
    };

    /**
     * 정보 섹션 스타일
     */
    const infoSectionStyles = {
        marginBottom: compact ? '16px' : '20px',
    };

    /**
     * 정보 항목 스타일
     */
    const infoItemStyles = {
        display: 'flex',
        marginBottom: '8px',
        fontSize: compact ? '14px' : '16px',
    };

    /**
     * 라벨 스타일
     */
    const labelStyles = {
        minWidth: compact ? '80px' : '100px',
        fontWeight: '600',
        color: '#374151',
        marginRight: '12px',
    };

    /**
     * 값 스타일
     */
    const valueStyles = {
        color: '#1f2937',
        flex: 1,
    };

    /**
     * 상태 배지 스타일
     */
    const getStatusBadgeStyles = (status) => {
        const baseStyles = {
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '16px',
        };

        // ConcertStatusColors에서 색상 정보 가져와서 CSS 스타일로 변환
        switch (status) {
            case 'SCHEDULED':
                return {
                    ...baseStyles,
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                };
            case 'ON_SALE':
                return {
                    ...baseStyles,
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                };
            case 'SOLD_OUT':
                return {
                    ...baseStyles,
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                };
            case 'CANCELLED':
                return {
                    ...baseStyles,
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                };
            case 'COMPLETED':
                return {
                    ...baseStyles,
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                };
            default:
                return {
                    ...baseStyles,
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                };
        }
    };

    /**
     * 버튼 기본 스타일
     */
    const buttonBaseStyles = {
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginRight: '12px',
    };

    // ===== 조건부 렌더링 =====

    /**
     * 로딩 상태일 때
     */
    if (loading) {
        return (
            <div
                className={`concert-detail ${className}`}
                style={containerStyles}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: compact ? 'column' : 'row',
                        gap: '24px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '300px',
                    }}
                >
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #f3f4f6',
                            borderTop: '4px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                        }}
                    />
                    <div
                        style={{
                            fontSize: '18px',
                            color: '#6b7280',
                        }}
                    >
                        콘서트 정보를 불러오는 중...
                    </div>
                </div>

                {/* CSS 애니메이션 */}
                <style jsx>{`
                    @keyframes spin {
                        from {
                            transform: rotate(0deg);
                        }
                        to {
                            transform: rotate(360deg);
                        }
                    }
                `}</style>
            </div>
        );
    }

    /**
     * 에러 상태일 때
     */
    if (error) {
        return (
            <div
                className={`concert-detail ${className}`}
                style={containerStyles}
            >
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
                            fontSize: '20px',
                        }}
                    >
                        콘서트 정보를 불러올 수 없습니다
                    </h3>
                    <p
                        style={{
                            color: '#6b7280',
                            marginBottom: '20px',
                            fontSize: '16px',
                        }}
                    >
                        {typeof error === 'string'
                            ? error
                            : '알 수 없는 오류가 발생했습니다.'}
                    </p>

                    {/* 새로고침 버튼 */}
                    {(showRefreshButton || onRefresh) && (
                        <button
                            onClick={handleRefreshClick}
                            style={{
                                ...buttonBaseStyles,
                                backgroundColor: '#3b82f6',
                                color: '#ffffff',
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
     * 콘서트 정보가 없을 때
     */
    if (!concert) {
        return (
            <div
                className={`concert-detail ${className}`}
                style={containerStyles}
            >
                <div
                    style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                    }}
                >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        🎭
                    </div>
                    <h3
                        style={{
                            color: '#6b7280',
                            fontSize: '20px',
                        }}
                    >
                        콘서트 정보가 없습니다
                    </h3>
                </div>
            </div>
        );
    }

    // 예매 버튼 정보 가져오기
    const bookingInfo = getBookingButtonInfo();

    // ===== 메인 렌더링 (정상 상태) =====

    return (
        <div className={`concert-detail ${className}`} style={containerStyles}>
            {/* 상단: 포스터 + 기본 정보 */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: compact ? 'column' : 'row',
                    gap: compact ? '16px' : '24px',
                    marginBottom: compact ? '20px' : '32px',
                }}
            >
                {/* 포스터 이미지 */}
                {concert.posterImageUrl && (
                    <div style={{ flex: 'none' }}>
                        <img
                            src={concert.posterImageUrl}
                            alt={`${concert.title} 포스터`}
                            style={posterStyles}
                            onError={handleImageError}
                            loading="lazy"
                        />
                    </div>
                )}

                {/* 기본 정보 */}
                <div style={{ flex: 1 }}>
                    {/* 상태 배지 */}
                    <div style={getStatusBadgeStyles(concert.status)}>
                        {ConcertStatusLabels[concert.status] || concert.status}
                    </div>

                    {/* 제목 */}
                    <h1 style={titleStyles}>{concert.title}</h1>

                    {/* 아티스트 */}
                    <div style={artistStyles}>🎤 {concert.artist}</div>

                    {/* 설명 (있는 경우에만) */}
                    {concert.description && !compact && (
                        <div
                            style={{
                                marginBottom: '20px',
                                padding: '12px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#374151',
                                lineHeight: '1.5',
                            }}
                        >
                            {concert.description}
                        </div>
                    )}

                    {/* 예매 버튼 */}
                    {bookingInfo.show && (
                        <button
                            onClick={handleBookingClick}
                            disabled={bookingInfo.disabled || isBooking}
                            style={{
                                ...buttonBaseStyles,
                                ...bookingInfo.style,
                                opacity: bookingInfo.disabled ? 0.7 : 1,
                                cursor: bookingInfo.disabled
                                    ? 'not-allowed'
                                    : 'pointer',
                            }}
                        >
                            {isBooking ? '처리 중...' : bookingInfo.text}
                        </button>
                    )}
                </div>
            </div>

            {/* 상세 정보 섹션들 */}
            {!compact && (
                <>
                    {/* 공연 정보 */}
                    <div style={infoSectionStyles}>
                        <h3
                            style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#1f2937',
                                marginBottom: '12px',
                                borderBottom: '2px solid #e5e7eb',
                                paddingBottom: '8px',
                            }}
                        >
                            📅 공연 정보
                        </h3>

                        <div style={infoItemStyles}>
                            <span style={labelStyles}>날짜</span>
                            <span style={valueStyles}>
                                {formatConcertDateTime()}
                            </span>
                        </div>

                        <div style={infoItemStyles}>
                            <span style={labelStyles}>종료 시간</span>
                            <span style={valueStyles}>{formatEndTime()}</span>
                        </div>

                        <div style={infoItemStyles}>
                            <span style={labelStyles}>장소</span>
                            <span style={valueStyles}>
                                📍 {concert.venueName}
                                {concert.venueAddress && (
                                    <div
                                        style={{
                                            fontSize: '14px',
                                            color: '#6b7280',
                                            marginTop: '4px',
                                        }}
                                    >
                                        {concert.venueAddress}
                                    </div>
                                )}
                            </span>
                        </div>

                        <div style={infoItemStyles}>
                            <span style={labelStyles}>총 좌석</span>
                            <span style={valueStyles}>
                                🎫{' '}
                                {concert.totalSeats?.toLocaleString() ||
                                    '정보 없음'}
                                석
                            </span>
                        </div>
                    </div>

                    {/* 예매 정보 */}
                    <div style={infoSectionStyles}>
                        <h3
                            style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#1f2937',
                                marginBottom: '12px',
                                borderBottom: '2px solid #e5e7eb',
                                paddingBottom: '8px',
                            }}
                        >
                            🎟️ 예매 정보
                        </h3>

                        <div style={infoItemStyles}>
                            <span style={labelStyles}>예매 기간</span>
                            <span style={valueStyles}>
                                {formatBookingPeriod()}
                            </span>
                        </div>

                        <div style={infoItemStyles}>
                            <span style={labelStyles}>연령 제한</span>
                            <span style={valueStyles}>
                                {concert.minAge
                                    ? `${concert.minAge}세 이상`
                                    : '전 연령 관람가'}
                            </span>
                        </div>

                        <div style={infoItemStyles}>
                            <span style={labelStyles}>최대 구매</span>
                            <span style={valueStyles}>
                                1인당 {concert.maxTicketsPerUser || 4}매까지
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// ===== 기본 PROPS =====
ConcertDetail.defaultProps = {
    loading: false,
    error: null,
    showBookingButton: true,
    showRefreshButton: false,
    className: '',
    compact: false,
};

export default ConcertDetail;
