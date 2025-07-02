// src/features/concert/types/review.js

/**
 * 리뷰 정보 타입 (백엔드 ReviewDTO 기반)
 * @typedef {Object} Review
 * @property {number} id - 리뷰 ID
 * @property {number} concertId - 콘서트 ID (읽기 전용)
 * @property {number} userId - 작성자 사용자 ID (필수, 최소 1)
 * @property {string} userNickname - 작성자 닉네임 (필수, 최대 50자)
 * @property {string} title - 리뷰 제목 (필수, 최대 100자)
 * @property {string} description - 리뷰 내용 (필수, 최대 1000자)
 * @property {number} rating - 관람 평점 (필수, 1-5점)
 * @property {string} createdAt - 리뷰 작성일시 (ISO 8601, 읽기 전용)
 * @property {string} updatedAt - 리뷰 수정일시 (ISO 8601, 읽기 전용)
 */

/**
 * 리뷰 작성/수정 데이터 (폼에서 사용)
 * @typedef {Object} ReviewFormData
 * @property {string} title - 리뷰 제목 (필수, 최대 100자)
 * @property {string} description - 리뷰 내용 (필수, 최대 1000자)
 * @property {number} rating - 관람 평점 (필수, 1-5점)
 * @property {string} userNickname - 작성자 닉네임 (필수, 최대 50자)
 * @property {number} userId - 작성자 사용자 ID (필수)
 */

/**
 * 리뷰 목록 조회 파라미터
 * @typedef {Object} ReviewListParams
 * @property {number} concertId - 콘서트 ID
 * @property {number} page - 페이지 번호 (0부터 시작, 기본값 0)
 * @property {number} size - 페이지 크기 (1-100, 기본값 10)
 * @property {string} sortBy - 정렬 기준 (createdAt, rating, title, 기본값 createdAt)
 * @property {string} sortDir - 정렬 방향 (asc, desc, 기본값 desc)
 */

/**
 * 평점 레이블 매핑
 */
export const RatingLabels = {
    1: '별로예요',
    2: '그저그래요',
    3: '보통이에요',
    4: '좋아요',
    5: '최고예요',
};

/**
 * 평점별 이모지
 */
export const RatingEmojis = {
    1: '😞',
    2: '😐',
    3: '🙂',
    4: '😊',
    5: '🤩',
};

/**
 * 평점별 색상 (Tailwind CSS 클래스)
 */
export const RatingColors = {
    1: 'text-red-500',
    2: 'text-orange-500',
    3: 'text-yellow-500',
    4: 'text-blue-500',
    5: 'text-green-500',
};

/**
 * 정렬 옵션 (백엔드 ReviewController sortBy 기준)
 */
export const ReviewSortOptions = [
    { value: 'createdAt', label: '최신순' },
    { value: 'rating', label: '평점순' },
    { value: 'title', label: '제목순' },
];

/**
 * 정렬 방향 옵션
 */
export const SortDirectionOptions = [
    { value: 'desc', label: '내림차순' },
    { value: 'asc', label: '오름차순' },
];

/**
 * 리뷰 검증 규칙 (백엔드 validation과 동일)
 */
export const ReviewValidation = {
    title: {
        required: true,
        maxLength: 100,
        minLength: 1,
    },
    description: {
        required: true,
        maxLength: 1000,
        minLength: 1,
    },
    rating: {
        required: true,
        min: 1,
        max: 5,
    },
    userNickname: {
        required: true,
        maxLength: 50,
        minLength: 1,
    },
    userId: {
        required: true,
        min: 1,
    },
};

/**
 * 리뷰 기본값
 */
export const ReviewDefaults = {
    rating: 5,
    sortBy: 'createdAt',
    sortDir: 'desc',
    pageSize: 10,
};
