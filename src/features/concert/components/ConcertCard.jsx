// src/features/concert/components/ConcertCard.jsx

// React 라이브러리에서 필요한 기능들을 import
import React from 'react';

// 콘서트 관련 타입과 상수들을 import
import { ConcertStatusLabels, ConcertStatusColors } from '../types/concert.js';

/**
 * ConcertCard 컴포넌트
 *
 * 🎯 역할:
 * - 콘서트 하나의 정보를 카드 형태로 표시하는 가장 기본적인 컴포넌트
 * - 콘서트 목록에서 각각의 항목을 나타내는 UI 요소
 * - 포스터 이미지, 제목, 아티스트, 날짜, 장소, 상태 등을 표시
 *
 * 📋 표시하는 정보:
 * - 포스터 이미지 (있으면 표시, 없으면 기본 이미지)
 * - 콘서트 제목
 * - 아티스트명
 * - 공연 날짜와 시간
 * - 공연장 이름
 * - 콘서트 상태 (예매 중, 매진 등)
 * - AI 요약 (있으면 일부만 표시)
 *
 * 🔄 사용 방법:
 * <ConcertCard
 *   concert={concertData}
 *   onClick={handleCardClick}
 *   showAiSummary={true}
 * />
 *
 * @param {Object} props - 컴포넌트에 전달되는 속성들
 * @param {import('../types/concert.js').Concert} props.concert - 표시할 콘서트 정보 객체 (필수)
 * @param {Function} props.onClick - 카드 클릭 시 실행될 함수 (선택사항)
 * @param {boolean} props.showAiSummary - AI 요약 표시 여부 (선택사항, 기본값: false)
 * @param {string} props.className - 추가 CSS 클래스 (선택사항)
 * @returns {JSX.Element} 렌더링될 JSX 요소
 */
const ConcertCard = ({
    concert,
    onClick,
    showAiSummary = false,
    className = '',
}) => {
    // ===== 데이터 유효성 검증 =====

    // concert 객체가 전달되지 않았거나 유효하지 않으면 에러 표시
    if (!concert) {
        return (
            <div
                style={{
                    border: '1px solid #ff0000',
                    padding: '16px',
                    color: '#ff0000',
                    backgroundColor: '#fff5f5',
                }}
            >
                ⚠️ 콘서트 정보를 불러올 수 없습니다.
            </div>
        );
    }

    // ===== 데이터 가공 =====

    /**
     * 날짜와 시간을 사용자에게 친화적인 형태로 변환
     * 예: "2025-08-15" + "19:00:00" → "2025년 8월 15일 오후 7:00"
     */
    const formatDateTime = () => {
        try {
            // concert.concertDate는 "YYYY-MM-DD" 형식의 문자열
            // concert.startTime은 "HH:mm:ss" 형식의 문자열

            if (!concert.concertDate || !concert.startTime) {
                return '날짜 미정';
            }

            // Date 객체 생성을 위해 날짜와 시간을 합침
            // 예: "2025-08-15T19:00:00"
            const dateTimeString = `${concert.concertDate}T${concert.startTime}`;
            const dateTime = new Date(dateTimeString);

            // 날짜가 유효하지 않으면 기본 텍스트 반환
            if (isNaN(dateTime.getTime())) {
                return '날짜 미정';
            }

            // 한국어 형식으로 날짜와 시간 포맷팅
            const dateOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short', // 요일 추가
            };

            const timeOptions = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true, // 오전/오후 표시
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
            // 날짜 파싱 에러 시 원본 데이터 표시
            console.warn('날짜 형식 변환 실패:', error);
            return `${concert.concertDate} ${concert.startTime}`;
        }
    };

    /**
     * AI 요약을 미리보기용으로 자르는 함수
     * 긴 요약문을 카드에 표시하기 적합한 길이로 조정
     *
     * @param {string} summary - 원본 AI 요약 텍스트
     * @param {number} maxLength - 최대 길이 (기본값: 80자)
     * @returns {string} 잘린 요약 텍스트
     */
    const truncateAiSummary = (summary, maxLength = 80) => {
        if (!summary || summary.length <= maxLength) {
            return summary;
        }

        // 지정된 길이에서 자르고 "..." 추가
        return summary.substring(0, maxLength).trim() + '...';
    };

    /**
     * 포스터 이미지 에러 처리 함수
     * 이미지 로드 실패 시 기본 이미지로 대체
     *
     * @param {Event} event - 이미지 에러 이벤트
     */
    const handleImageError = (event) => {
        // 이미지 로드 실패 시 기본 콘서트 이미지로 대체
        // 실제 환경에서는 public 폴더에 기본 이미지를 준비해야 함
        event.target.src = '/images/basic-poster-image.png';

        // 기본 이미지도 없으면 alt 텍스트 표시를 위해 이미지 숨김
        event.target.onerror = () => {
            event.target.style.display = 'none';
        };
    };

    /**
     * 카드 클릭 핸들러
     * 부모 컴포넌트에서 전달받은 onClick 함수가 있으면 실행
     */
    const handleCardClick = () => {
        if (onClick && typeof onClick === 'function') {
            // 콘서트 정보를 함께 전달
            onClick(concert);
        }
    };

    // ===== 스타일 정의 =====

    /**
     * 카드의 기본 스타일
     * CSS 없이도 최소한의 시각적 구분을 위한 인라인 스타일
     */
    const cardStyles = {
        // 카드 레이아웃
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px',
        backgroundColor: '#ffffff',

        // 그림자 효과 (깊이감 표현)
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',

        // 호버 효과와 클릭 가능함을 나타내는 커서
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',

        // 반응형 레이아웃
        maxWidth: '300px',
        width: '100%',
    };

    /**
     * 호버 효과용 스타일 (마우스 올렸을 때)
     * CSS :hover를 인라인으로 구현하기 어려우므로 생략
     * 실제로는 CSS 클래스로 처리하는 것이 좋음
     */
    const hoverStyles = onClick
        ? {
              ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
              },
          }
        : {};

    /**
     * 포스터 이미지 스타일
     */
    const imageStyles = {
        width: '100%',
        height: '200px',
        objectFit: 'cover', // 이미지 비율 유지하면서 영역 채우기
        borderRadius: '4px',
        marginBottom: '12px',
        backgroundColor: '#f5f5f5', // 이미지 로딩 중 배경색
    };

    /**
     * 상태 배지 스타일
     * concert.status에 따라 다른 색상 적용
     */
    const statusStyles = {
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        marginTop: '8px',
        // ConcertStatusColors에서 해당 상태의 색상 가져오기
        // 기본값으로 회색 설정
        ...getStatusColor(concert.status),
    };

    /**
     * 상태별 색상을 반환하는 헬퍼 함수
     *
     * @param {string} status - 콘서트 상태
     * @returns {Object} 색상 스타일 객체
     */
    function getStatusColor(status) {
        // ConcertStatusColors는 Tailwind CSS 클래스 문자열이므로
        // 인라인 스타일용으로 변환이 필요
        switch (status) {
            case 'SCHEDULED':
                return { backgroundColor: '#fef3c7', color: '#92400e' }; // 노란색
            case 'ON_SALE':
                return { backgroundColor: '#d1fae5', color: '#065f46' }; // 초록색
            case 'SOLD_OUT':
                return { backgroundColor: '#fee2e2', color: '#991b1b' }; // 빨간색
            case 'CANCELLED':
                return { backgroundColor: '#f3f4f6', color: '#374151' }; // 회색
            case 'COMPLETED':
                return { backgroundColor: '#dbeafe', color: '#1e40af' }; // 파란색
            default:
                return { backgroundColor: '#f3f4f6', color: '#374151' }; // 기본 회색
        }
    }

    // ===== JSX 렌더링 =====

    return (
        <div
            className={`concert-card ${className}`}
            style={cardStyles}
            onClick={handleCardClick}
            onKeyDown={(e) => {
                if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleCardClick();
                }
            }}
            // 접근성: 키보드 탐색 지원
            tabIndex={onClick ? 0 : -1}
            // 접근성: 스크린 리더를 위한 역할 정의
            role={onClick ? 'button' : 'article'}
            // 접근성: 스크린 리더용 라벨
            aria-label={`${concert.title} - ${concert.artist} 콘서트 정보`}
        >
            {/* 포스터 이미지 섹션 */}
            <div style={{ marginBottom: '12px' }}>
                <img
                    src={
                        concert.posterImageUrl ||
                        '/images/basic-poster-image.png'
                    }
                    alt={`${concert.title} 포스터`}
                    style={imageStyles}
                    onError={handleImageError}
                    loading="lazy"
                />
            </div>

            {/* 콘서트 기본 정보 섹션 */}
            <div style={{ marginBottom: '12px' }}>
                {/* 콘서트 제목 */}
                <h3
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        lineHeight: '1.4',
                    }}
                >
                    {concert.title}
                </h3>

                {/* 아티스트명 */}
                <p
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '500',
                    }}
                >
                    {concert.artist}
                </p>

                {/* 공연 날짜와 시간 */}
                <p
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: '#374151',
                    }}
                >
                    📅 {formatDateTime()}
                </p>

                {/* 공연장 정보 */}
                <p
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: '#374151',
                    }}
                >
                    📍 {concert.venueName}
                </p>

                {/* 총 좌석 수 (있는 경우에만 표시) */}
                {concert.totalSeats && (
                    <p
                        style={{
                            margin: '0 0 8px 0',
                            fontSize: '12px',
                            color: '#6b7280',
                        }}
                    >
                        🎫 총 {concert.totalSeats.toLocaleString()}석
                    </p>
                )}
            </div>

            {/* AI 요약 섹션 (showAiSummary가 true이고 요약이 있을 때만 표시) */}
            {showAiSummary && concert.aiSummary && (
                <div
                    style={{
                        marginBottom: '12px',
                        padding: '8px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '4px',
                        borderLeft: '3px solid #3b82f6',
                    }}
                >
                    <p
                        style={{
                            margin: '0',
                            fontSize: '12px',
                            color: '#475569',
                            lineHeight: '1.4',
                        }}
                    >
                        🤖 {truncateAiSummary(concert.aiSummary)}
                    </p>
                </div>
            )}

            {/* 콘서트 상태 배지 */}
            <div>
                <span style={statusStyles}>
                    {ConcertStatusLabels[concert.status] || concert.status}
                </span>
            </div>
        </div>
    );
};

// ===== PropTypes 검증 (선택사항) =====
// 개발 시 props 타입 체크를 위한 설정
// 실제 환경에서는 TypeScript 사용을 권장

// ConcertCard.propTypes = {
//   concert: PropTypes.object.isRequired,
//   onClick: PropTypes.func,
//   showAiSummary: PropTypes.bool,
//   className: PropTypes.string
// };

// ===== 기본 props 값 =====
ConcertCard.defaultProps = {
    showAiSummary: false,
    className: '',
    onClick: null,
};

// 컴포넌트를 다른 파일에서 import할 수 있도록 export
export default ConcertCard;
