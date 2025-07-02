// src/features/concert/types/concert.js

/**
 * 콘서트 상태 enum (백엔드 ConcertStatus와 동일)
 * @typedef {"SCHEDULED"|"ON_SALE"|"SOLD_OUT"|"CANCELLED"|"COMPLETED"} ConcertStatus
 */
export const ConcertStatus = {
    SCHEDULED: 'SCHEDULED', // 예정됨 (예매 시작 전)
    ON_SALE: 'ON_SALE', // 예매 중
    SOLD_OUT: 'SOLD_OUT', // 매진됨
    CANCELLED: 'CANCELLED', // 취소됨
    COMPLETED: 'COMPLETED', // 완료됨
};

/**
 * 콘서트 상태 한국어 매핑
 */
export const ConcertStatusLabels = {
    [ConcertStatus.SCHEDULED]: '예매 대기',
    [ConcertStatus.ON_SALE]: '예매 중',
    [ConcertStatus.SOLD_OUT]: '매진',
    [ConcertStatus.CANCELLED]: '취소됨',
    [ConcertStatus.COMPLETED]: '공연 완료',
};

/**
 * 콘서트 상태별 색상 (Tailwind CSS 클래스)
 */
export const ConcertStatusColors = {
    [ConcertStatus.SCHEDULED]: 'bg-yellow-100 text-yellow-800',
    [ConcertStatus.ON_SALE]: 'bg-green-100 text-green-800',
    [ConcertStatus.SOLD_OUT]: 'bg-red-100 text-red-800',
    [ConcertStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
    [ConcertStatus.COMPLETED]: 'bg-blue-100 text-blue-800',
};

/**
 * 콘서트 정보 타입 (백엔드 ConcertDTO 기반)
 * @typedef {Object} Concert
 * @property {number} concertId - 콘서트 ID
 * @property {string} title - 콘서트 제목
 * @property {string} artist - 아티스트명
 * @property {string} description - 콘서트 설명
 * @property {number} sellerId - 판매자 ID
 * @property {string} venueName - 공연장명
 * @property {string} venueAddress - 공연장 주소
 * @property {string} concertDate - 콘서트 날짜 (YYYY-MM-DD)
 * @property {string} startTime - 시작 시간 (HH:mm:ss)
 * @property {string} endTime - 종료 시간 (HH:mm:ss)
 * @property {number} totalSeats - 총 좌석 수
 * @property {string} bookingStartDate - 예매 시작일시 (ISO 8601)
 * @property {string} bookingEndDate - 예매 종료일시 (ISO 8601)
 * @property {number} minAge - 최소 연령 제한
 * @property {number} maxTicketsPerUser - 사용자당 최대 구매 가능 티켓 수
 * @property {ConcertStatus} status - 콘서트 상태
 * @property {string} posterImageUrl - 포스터 이미지 URL
 * @property {string} aiSummary - AI 생성 요약
 */

/**
 * 판매자 콘서트 정보 타입 (백엔드 SellerConcertDTO 기반)
 * @typedef {Object} SellerConcert
 * @property {number} concertId - 콘서트 ID
 * @property {string} title - 콘서트 제목
 * @property {string} artist - 아티스트명
 * @property {string} description - 콘서트 설명
 * @property {number} sellerId - 판매자 ID
 * @property {string} venueName - 공연장명
 * @property {string} venueAddress - 공연장 주소
 * @property {string} concertDate - 콘서트 날짜 (YYYY-MM-DD)
 * @property {string} startTime - 시작 시간 (HH:mm:ss)
 * @property {string} endTime - 종료 시간 (HH:mm:ss)
 * @property {number} totalSeats - 총 좌석 수
 * @property {string} bookingStartDate - 예매 시작일시 (ISO 8601)
 * @property {string} bookingEndDate - 예매 종료일시 (ISO 8601)
 * @property {number} minAge - 최소 연령 제한
 * @property {number} maxTicketsPerUser - 사용자당 최대 구매 가능 티켓 수
 * @property {ConcertStatus} status - 콘서트 상태
 * @property {string} posterImageUrl - 포스터 이미지 URL
 * @property {string} aiSummary - AI 생성 요약
 * @property {string} createdAt - 생성일시 (ISO 8601)
 * @property {string} updatedAt - 수정일시 (ISO 8601)
 */

/**
 * 콘서트 목록 조회 파라미터
 * @typedef {Object} ConcertListParams
 * @property {number} page - 페이지 번호 (0부터 시작)
 * @property {number} size - 페이지 크기 (1-100)
 */

/**
 * 콘서트 검색 파라미터 (백엔드 ConcertSearchDTO 기반)
 * @typedef {Object} ConcertSearchParams
 * @property {string} keyword - 검색 키워드 (1-100자)
 */

/**
 * 콘서트 필터 파라미터 (백엔드 ConcertFilterDTO 기반)
 * @typedef {Object} ConcertFilterParams
 * @property {string} startDate - 시작 날짜 (YYYY-MM-DD)
 * @property {string} endDate - 종료 날짜 (YYYY-MM-DD)
 * @property {number} priceMin - 최소 가격
 * @property {number} priceMax - 최대 가격
 */

/**
 * 판매자 콘서트 생성 데이터 (백엔드 SellerConcertCreateDTO 기반)
 * @typedef {Object} SellerConcertCreateData
 * @property {string} title - 콘서트 제목 (필수, 1-100자)
 * @property {string} artist - 아티스트명 (필수, 1-50자)
 * @property {string} description - 콘서트 설명 (선택, 최대 1000자)
 * @property {string} venueName - 공연장명 (필수, 1-100자)
 * @property {string} venueAddress - 공연장 주소 (선택, 최대 200자)
 * @property {string} concertDate - 콘서트 날짜 (필수, YYYY-MM-DD, 미래 날짜)
 * @property {string} startTime - 시작 시간 (필수, HH:mm:ss)
 * @property {string} endTime - 종료 시간 (필수, HH:mm:ss)
 * @property {number} totalSeats - 총 좌석 수 (필수, 1-100000)
 * @property {string} bookingStartDate - 예매 시작일시 (필수, ISO 8601, 미래 시간)
 * @property {string} bookingEndDate - 예매 종료일시 (필수, ISO 8601, 미래 시간)
 * @property {number} minAge - 최소 연령 제한 (선택, 0-100, 기본값 0)
 * @property {number} maxTicketsPerUser - 최대 구매 가능 티켓 수 (선택, 1-10, 기본값 4)
 * @property {string} posterImageUrl - 포스터 이미지 URL (선택, 이미지 URL 형식)
 */

/**
 * 판매자 콘서트 수정 데이터 (백엔드 SellerConcertUpdateDTO 기반)
 * 모든 필드가 선택사항이며, 최소 하나의 필드는 제공되어야 함
 * @typedef {Object} SellerConcertUpdateData
 * @property {string} title - 콘서트 제목 (선택, 최대 100자)
 * @property {string} artist - 아티스트명 (선택, 최대 50자)
 * @property {string} description - 콘서트 설명 (선택, 최대 1000자)
 * @property {string} venueName - 공연장명 (선택, 최대 100자)
 * @property {string} venueAddress - 공연장 주소 (선택, 최대 200자)
 * @property {string} concertDate - 콘서트 날짜 (선택, YYYY-MM-DD, 미래 날짜)
 * @property {string} startTime - 시작 시간 (선택, HH:mm:ss)
 * @property {string} endTime - 종료 시간 (선택, HH:mm:ss)
 * @property {number} totalSeats - 총 좌석 수 (선택, 1-100000)
 * @property {string} bookingStartDate - 예매 시작일시 (선택, ISO 8601, 미래 시간)
 * @property {string} bookingEndDate - 예매 종료일시 (선택, ISO 8601, 미래 시간)
 * @property {number} minAge - 최소 연령 제한 (선택, 0-100)
 * @property {number} maxTicketsPerUser - 최대 구매 가능 티켓 수 (선택, 1-10)
 * @property {ConcertStatus} status - 콘서트 상태 (선택)
 * @property {string} posterImageUrl - 포스터 이미지 URL (선택, 이미지 URL 형식)
 */

/**
 * 포스터 이미지 업데이트 데이터 (백엔드 SellerConcertImageUpdateDTO 기반)
 * @typedef {Object} SellerConcertImageUpdateData
 * @property {string} posterImageUrl - 포스터 이미지 URL (필수, 이미지 URL 형식)
 */

/**
 * 페이지네이션 응답 타입
 * @typedef {Object} PageResponse
 * @property {Array} content - 실제 데이터 배열
 * @property {number} totalElements - 전체 요소 수
 * @property {number} totalPages - 전체 페이지 수
 * @property {number} number - 현재 페이지 번호 (0부터 시작)
 * @property {number} size - 페이지 크기
 * @property {boolean} first - 첫 번째 페이지 여부
 * @property {boolean} last - 마지막 페이지 여부
 */

/**
 * API 응답 래퍼 타입 (백엔드 SuccessResponse 기반)
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 성공 여부
 * @property {string} message - 응답 메시지
 * @property {*} data - 실제 데이터
 */
